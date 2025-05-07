import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Extract document ID from event
    const documentId = event.pathParameters?.id || JSON.parse(event.body || '{}').documentId;
    
    if (!documentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Document ID is required" })
      };
    }
    
    // Add your deletion logic here
    // For example: aws-sdk to delete from S3 or DynamoDB
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Document deleted successfully", documentId })
    };
  } catch (error: unknown) {
    console.error("Error deleting document:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: "Error deleting document", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    };
  }
};