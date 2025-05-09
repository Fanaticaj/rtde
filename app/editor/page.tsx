"use client";

import "@/lib/amplifyClient";
import React, {
  useState,
  useEffect,
  useRef,
  FC,
  ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import Link from "next/link";

const Editor: FC = () => {
  // Get document ID from URL params with updated fallback ID
  let url_params: URLSearchParams;
  let docId;
  if (typeof window !== "undefined") {
    url_params = new URLSearchParams(window.location.search);
    docId = url_params.get("docId");
  } else {
    docId = null;
  }
  
  // Use the provided document ID as fallback
  if (docId === null) {
    docId = "5416c8be-7c41-4ea2-b6ce-22b0e3c19634";
  }
  
  console.log("🔍 Editor - Document ID:", docId);

  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [bold, setBold] = useState<boolean>(false);
  const [italic, setItalic] = useState<boolean>(false);
  const [underline, setUnderline] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Check if the API routes are working
  const checkApiRoutes = async () => {
    try {
      console.log("🔍 Testing API route connection...");
      const response = await fetch(`/api/documents/test`);
      const data = await response.json();
      console.log("🔍 API route response:", data);
      setDebugInfo(data);
      return true;
    } catch (error) {
      console.error("🔍 API route test failed:", error);
      setDebugInfo({ error: String(error) });
      return false;
    }
  };

  // Function to fetch document using API route
  const fetchDocument = async () => {
    console.log(`🔍 Fetching document with ID: ${docId}`);
    
    try {
      setLoading(true);
      // First check if our API routes are working
      const apiRoutesWorking = await checkApiRoutes();
      
      // If API routes are working, try to fetch the actual document
      const response = await fetch(`/api/documents/${docId}`);
      console.log(`🔍 Fetch response status: ${response.status}`);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          console.error("🔍 Error response:", errorData);
          errorMessage = `Error: ${response.status} - ${errorData.error || "Unknown error"}`;
        } catch (e) {
          // If we can't parse the error as JSON
          const errorText = await response.text();
          console.error("🔍 Error text:", errorText);
          errorMessage = `Error: ${response.status} - Unable to parse error response`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("🔍 Fetch data:", data);
      
      // Check for our simplified API debug mode response
      if (data.message && data.debug_info) {
        console.log("🔍 Debug info from API route:", data.debug_info);
        setDebugInfo(data.debug_info);
        // Set placeholder content since we're in debug mode
        setContent("API routes are working correctly. This is debug mode content.");
        setTitle("Debug Mode Document");
      } 
      // Regular API response with document data
      else if (data && data.document) {
        setContent(data.document.content || "");
        setTitle(data.document.title || "Untitled Document");
      } 
      // Unexpected response format
      else {
        console.error("🔍 Unexpected response format:", data);
        setError("Document not found or has invalid format");
      }
    } catch (error) {
      console.error("🔍 Error fetching document:", error);
      setError(error instanceof Error ? error.message : "Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle content edits
  const handleEdit = async (event: ChangeEvent<HTMLTextAreaElement>) => {
    const updatedContent = event.target.value;
    setContent(updatedContent);

    // Debounce updates to avoid excessive API calls
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(async () => {
      try {
        console.log(`🔍 Saving document changes for ID: ${docId}`);
        const response = await fetch(`/api/documents/${docId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            content: updatedContent,
            id: docId 
          }),
        });

        if (!response.ok) {
          console.error("🔍 Failed to update document:", response.status);
          const errorText = await response.text();
          console.error("🔍 Error text:", errorText);
        } else {
          const data = await response.json();
          console.log("🔍 Update response:", data);
        }
      } catch (error) {
        console.error("🔍 Error updating document:", error);
      }
    }, 1000);
  };

  // Function to download the document
  const handleDownload = async () => {
    try {
      // Create downloadable file from current content
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${title || "document"}.txt`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("🔍 Download failed:", error);
      alert("Failed to download document.");
    }
  };

  // Toggle text formatting styles
  const toggleStyle = (
    style: boolean,
    setter: Dispatch<SetStateAction<boolean>>,
    eventName: string
  ): void => {
    setter((prev: boolean) => !prev);
  };

  // Initial document fetch
  useEffect(() => {
    fetchDocument();
    
    // Set up polling for real-time updates (every 5 seconds)
    const interval = setInterval(() => {
      if (!loading) { // Only fetch if not already loading
        fetchDocument();
      }
    }, 10000); // Increased to 10 seconds to reduce API calls during debugging
    
    // Clean up on unmount
    return () => {
      clearInterval(interval);
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [docId]);

  if (loading && !content) {
    return (
      <div className="container">
        <div className="card">
          <h2 className="editor-title">Loading document...</h2>
          <p>Document ID: {docId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h2 className="editor-title">Error</h2>
          <p>{error}</p>
          {debugInfo && (
            <div className="debug-info">
              <h3>Debug Information</h3>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
          <div className="action-buttons">
            <Link href="/" className="refresh-button">
              Go to Document List
            </Link>
            <button onClick={fetchDocument} className="refresh-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Authenticator>
      {({ signOut }) => (
        <div className="container">
          <div className="card">
            <h2 className="editor-title">{title || "Real-time Collaborative Editor"}</h2>
            <p className="document-info">Document ID: {docId}</p>
            
            {/* Formatting Controls */}
            <div className="formatting-controls">
              <button
                className={`format-button ${bold ? "active" : ""}`}
                onClick={() => toggleStyle(bold, setBold, "bold")}
              >
                <b>B</b>
              </button>
              <button
                className={`format-button ${italic ? "active" : ""}`}
                onClick={() => toggleStyle(italic, setItalic, "italic")}
              >
                <i>I</i>
              </button>
              <button
                className={`format-button ${underline ? "active" : ""}`}
                onClick={() => toggleStyle(underline, setUnderline, "underline")}
              >
                <u>U</u>
              </button>
            </div>

            {/* Editor Text Area */}
            <div className="text-control">
              <textarea
                className="text-area"
                value={content}
                onChange={handleEdit}
                placeholder="Start typing..."
                style={{
                  fontWeight: bold ? "bold" : "normal",
                  fontStyle: italic ? "italic" : "normal",
                  textDecoration: underline ? "underline" : "none",
                }}
              />
            </div>

            {/* Debug Info (only shown in debug mode) */}
            {debugInfo && (
              <div className="debug-info">
                <h3>Debug Information</h3>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <Link href="/" className="refresh-button">
                Document List
              </Link>
              <button className="refresh-button" onClick={fetchDocument}>
                Refresh
              </button>
              <button className="download-button" onClick={handleDownload}>
                Download
              </button>
              <button className="signout-button" onClick={signOut}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </Authenticator>
  );
};

export default Editor;