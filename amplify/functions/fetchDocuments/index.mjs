// AWS Lambda function that retrieves all documents from DynamoDB using a scan operation, making them available for your frontend to display
// Runtime: Node.js 22.x
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = "Document-nu434abnqjhf3kcbgxbcibzamu-NONE";

export const handler = async (event) => {
  console.log("Event received:", JSON.stringify(event, null, 2));
  
  try {
    // Scan the DynamoDB table to get all documents
    const scanParams = {
      TableName: tableName,
    };
    
    const scanResponse = await docClient.send(new ScanCommand(scanParams));
    
    // Return the results
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // For CORS support
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET"
      },
      body: JSON.stringify({
        documents: scanResponse.Items || [],
        count: scanResponse.Count || 0
      })
    };
  } catch (error) {
    console.error("Error fetching documents:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET"
      },
      body: JSON.stringify({ 
        error: "Failed to fetch documents", 
        details: error.message 
      })
    };
  }
};