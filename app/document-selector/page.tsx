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

const Editor: FC = () => {
  // Get document ID from URL params
  let url_params: URLSearchParams;
  let docId;
  if (typeof window !== "undefined") {
    url_params = new URLSearchParams(window.location.search);
    docId = url_params.get("docId");
  } else {
    docId = null;
  }
  if (docId === null) {
    docId = "848cca7a-3bf8-443f-aa9a-2f18a185189f";
  }
  console.log("Document ID:", docId);

  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [bold, setBold] = useState<boolean>(false);
  const [italic, setItalic] = useState<boolean>(false);
  const [underline, setUnderline] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch document using downloadDocument Lambda
  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${docId}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.document) {
        setContent(data.document.content || "");
        setTitle(data.document.title || "Untitled Document");
      } else {
        setError("Document not found");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setError("Failed to load document");
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
          console.error("Failed to update document");
        }
      } catch (error) {
        console.error("Error updating document:", error);
      }
    }, 1000);
  };

  // Function to download the document
  const handleDownload = async () => {
    try {
      // Use downloadDocument Lambda function
      const response = await fetch(`/api/documents/${docId}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();

      if (!data || !data.document) {
        alert("No document found.");
        return;
      }

      // Create downloadable file
      const blob = new Blob([data.document.content || ""], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.document.title || "document"}.txt`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
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
      fetchDocument();
    }, 5000);
    
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
          <button onClick={() => window.history.back()}>Go Back</button>
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

            {/* Action Buttons */}
            <div className="action-buttons">
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