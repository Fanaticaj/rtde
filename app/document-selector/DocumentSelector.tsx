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
    // setLoading(true);
    // try {
    //   const response = await handler(event);
    //   const data = await response.body;
    //   //setDocuments(data);
    //   console.log(data);
    // } catch (error) {
    //   console.error("Failed to fetch documents:", error);
    // } finally {
    //   setLoading(false);
    // }
    const {data} = await client.models.Document.list();
    let docs:Document[]=[];
    for (const d of data){
      var str:string;
      str = d.title || "";
      var temp: Document = {title: str, id: d.id, createdAt: d.createdAt, updatedAt: d.updatedAt};
      docs.push(temp)
    }
    console.log(docs);
    setDocuments(docs);

  };

  const createDocument = async () => {
    const str = window.prompt("Create New Document");
    if(str != null){
      client.models.Document.create({title: str,});
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
