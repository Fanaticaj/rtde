"use client";

import { useState, useEffect } from "react";
import DocumentTile from "./DocumentTile";
import Editor from "../editor/page";
import { generateClient } from "aws-amplify/data";
import type {Schema} from "../../amplify/data/resource";
import { ModelField, Nullable } from "@aws-amplify/data-schema";

interface Document {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentSelectorProps {
  signOut?: () => void;
}

const client = generateClient<Schema>();

export default function DocumentSelector({ signOut }: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      if (data && data.documents) {
        setDocuments(data.documents);
      }
      console.log("Fetched documents:", data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const createDocument = async () => {
    const title = window.prompt("Create New Document");
    if (title) {
      try {
        const response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        });
        
        if (response.ok) {
          fetchDocuments(); // Refresh the list
        }
      } catch (error) {
        console.error("Failed to create document:", error);
      }
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h1 className="editor-title">Select a Document</h1>

        <div className="action-buttons">
          <button onClick={fetchDocuments} className="refresh-button">
            Refresh
          </button>
          <button onClick={createDocument} className="crete-new-button">
            Create New Document
          </button>
          <button onClick={() => signOut?.()} className="signout-button">
            Sign Out
          </button>
        </div>

        <div className="text-control">
          {loading ? (
            <p>Loading...</p>
          ) : (
            documents.map((doc) => (
              <DocumentTile
                key={doc.id}
                id={doc.id}
                title={doc.title}
                createdAt={doc.createdAt}
              />
            ))
          )}
          
        </div>
      </div>
    </div>
  );
}
