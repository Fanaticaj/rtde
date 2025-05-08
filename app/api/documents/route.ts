import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const apiEndpoint = process.env.LAMBDA_ENDPOINT;
  
  try {
    const response = await fetch(`${apiEndpoint}/documents`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const apiEndpoint = process.env.LAMBDA_ENDPOINT;
  
  try {
    const body = await request.json();
    
    const response = await fetch(`${apiEndpoint}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" }, 
      { status: 500 }
    );
  }
}