import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get basic information for debugging
  const id = params.id;
  const apiEndpoint = process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT;
  const url = apiEndpoint ? `${apiEndpoint}/documents/${id}` : "No API endpoint configured";
  
  // Create environment variables object with proper typing
  const envVars: Record<string, string | undefined> = {};
  Object.keys(process.env)
    .filter(key => key.startsWith('NEXT_') || key.startsWith('LAMBDA_'))
    .forEach(key => {
      envVars[key] = process.env[key];
    });
  
  // Return a simple success response with debug information
  return NextResponse.json({
    message: "API route is functioning correctly",
    debug_info: {
      id: id,
      timestamp: new Date().toISOString(),
      api_endpoint_configured: !!apiEndpoint,
      api_endpoint_value: apiEndpoint || "NOT SET",
      request_url: url,
      env_vars: envVars
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Similar simplified response for DELETE
  return NextResponse.json({
    message: "DELETE route is functioning correctly",
    id: params.id,
    api_endpoint: process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT || "NOT SET"
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get request body for PUT
  let body = null;
  try {
    body = await request.json();
  } catch (error) {
    // If body parsing fails, just note it
    body = "Failed to parse request body";
  }
  
  // Return simple success response with debug info
  return NextResponse.json({
    message: "PUT route is functioning correctly",
    id: params.id,
    api_endpoint: process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT || "NOT SET",
    received_body: body
  });
}