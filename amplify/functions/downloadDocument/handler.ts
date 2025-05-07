import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Extract document ID from event
    const documentId = event.pathParameters?.id || event.queryStringParameters?.documentId;
    
    if (!documentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Document ID is required" })
      };
    }
    
    // Add your document retrieval logic here
    // For example: aws-sdk to get from S3 or DynamoDB
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // Add more headers if needed for downloads
      },
      body: JSON.stringify({ 
        message: "Document retrieved successfully", 
        documentId,
        // Include document content or download URL here
      })
    };
  } catch (error: unknown) {
    console.error("Error downloading document:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: "Error downloading document", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    };
  }
};