import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.DOCUMENT_TABLE_NAME || "Document-vnyciacn2nca3b6znjb4pulud4-NONE";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Event received:", JSON.stringify(event, null, 2));
  
  try {
    // Extract document ID from the event
    const documentId = event.pathParameters?.id || 
                       event.queryStringParameters?.id ||
                       JSON.parse(event.body || '{}').id;
    
    if (!documentId) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET"
        },
        body: JSON.stringify({ error: "Document ID is required" })
      };
    }
    
    // Get the document from DynamoDB
    const getParams = {
      TableName: tableName,
      Key: {
        id: documentId
      }
    };
    
    const { Item } = await docClient.send(new GetCommand(getParams));
    
    if (!Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Methods": "GET"
        },
        body: JSON.stringify({ error: "Document not found" })
      };
    }
    
    // Return the document content
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
        "Content-Disposition": `attachment; filename="${Item.title || 'document'}.txt"`
      },
      body: JSON.stringify({
        document: Item,
        content: Item.content || "",
        title: Item.title || "document"
      })
    };
  } catch (error: unknown) {
    console.error("Error downloading document:", error);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET"
      },
      body: JSON.stringify({ 
        error: "Failed to download document", 
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};