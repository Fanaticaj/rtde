import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const apiEndpoint = process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT;
  
  // Create environment variables object with proper typing
  const envVars: Record<string, string | undefined> = {};
  Object.keys(process.env)
    .filter(key => key.startsWith('NEXT_') || key.startsWith('LAMBDA_'))
    .forEach(key => {
      envVars[key] = process.env[key];
    });
  
  return NextResponse.json({
    message: "Documents list API route is functioning correctly",
    debug_info: {
      timestamp: new Date().toISOString(),
      api_endpoint_configured: !!apiEndpoint,
      api_endpoint_value: apiEndpoint || "NOT SET",
      env_vars: envVars
    }
  });
}

export async function POST(request: NextRequest) {
  let body = null;
  try {
    body = await request.json();
  } catch (error) {
    body = "Failed to parse request body";
  }
  
  return NextResponse.json({
    message: "POST route is functioning correctly",
    api_endpoint: process.env.NEXT_PUBLIC_LAMBDA_ENDPOINT || "NOT SET",
    received_body: body
  });
}