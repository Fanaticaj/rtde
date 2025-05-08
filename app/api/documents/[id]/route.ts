import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiEndpoint = process.env.LAMBDA_ENDPOINT;
  const id = params.id;
  
  try {
    const response = await fetch(`${apiEndpoint}/documents/${id}`);
    
    if (!response.ok) {
      // If document not found, return 404
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Document not found" }, 
          { status: 404 }
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching document ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch document" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiEndpoint = process.env.LAMBDA_ENDPOINT;
  const id = params.id;
  
  try {
    const response = await fetch(`${apiEndpoint}/documents/${id}`, {
      method: "DELETE"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error);
    return NextResponse.json(
      { error: "Failed to delete document" }, 
      { status: 500 }
    );
  }
}