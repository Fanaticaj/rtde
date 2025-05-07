import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({ region: "us-west-1" });
const docClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.DOCUMENT_TABLE_NAME || "Document-vnyciacn2nca3b6znjb4pulud4-NONE";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Event received:", JSON.stringify(event, null, 2));
  
  try {
    // Parse document data from request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST"
        },
        body: JSON.stringify({ error: "Request body is required" })
      };
    }
    
    const requestBody = JSON.parse(event.body);
    
    // Validate required fields
    if (!requestBody.title) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "POST"
        },
        body: JSON.stringify({ error: "Document title is required" })
      };
    }
    
    // Create document with required fields and timestamps
    const now = new Date().toISOString();
    const documentId = requestBody.id || randomUUID();
    
    const document = {
      __typename: "Document",
      id: documentId,
      title: requestBody.title,
      content: requestBody.content || "",
      createdAt: now,
      updatedAt: now
    };
    
    // Put the document in DynamoDB
    const putParams = {
      TableName: tableName,
      Item: document
    };
    
    await docClient.send(new PutCommand(putParams));
    
    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST"
      },
      body: JSON.stringify({
        message: "Document created successfully",
        document
      })
    };
  } catch (error: unknown) {
    console.error("Error creating document:", error);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST"
      },
      body: JSON.stringify({ 
        error: "Failed to create document", 
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};