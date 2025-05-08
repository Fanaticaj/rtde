import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  GraphqlApi,
  SchemaFile,
  AuthorizationType,
  FieldLogLevel,
} from 'aws-cdk-lib/aws-appsync';
import {
  Table,
  AttributeType,
  BillingMode,
} from 'aws-cdk-lib/aws-dynamodb';
import {
  Function,
  Runtime,
  Code,
} from 'aws-cdk-lib/aws-lambda';
import {
  Duration,
  Expiration,
  RemovalPolicy,
  CfnOutput,
} from 'aws-cdk-lib';

export class RealtimeDocStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1) DynamoDB table
    const table = new Table(this, 'DocumentsTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // 2) AppSync API
    const api = new GraphqlApi(this, 'RealtimeDocAPI', {
      name: 'RealtimeDocumentAPI',
      schema: SchemaFile.fromAsset(path.join(__dirname, '../schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
          apiKeyConfig: { expires: Expiration.after(Duration.days(365)) },
        },
      },
      logConfig: { fieldLogLevel: FieldLogLevel.ALL },
    });

    // Helper to wire a Lambda → DataSource → Resolver
    const makeLambdaResolver = (
      id: string,
      folder: string,
      typeName: 'Query' | 'Mutation',
      fieldName: string,
      perms: { read?: boolean; write?: boolean }
    ) => {
      const fn = new Function(this, id, {
        runtime: Runtime.NODEJS_20_X,
        handler: 'index.handler',
        code: Code.fromAsset(
          path.join(__dirname, `../../amplify/functions/${folder}`)
        ),
        environment: { DOCUMENT_TABLE_NAME: table.tableName },
      });
      if (perms.read)  table.grantReadData(fn);
      if (perms.write) table.grantWriteData(fn);

      const ds = api.addLambdaDataSource(`${id}DS`, fn);
      ds.createResolver(`${id}Resolver`, { typeName, fieldName });
    };

    // 1) List all documents
    makeLambdaResolver(
      'FetchDocumentsFn',
      'fetchDocuments',
      'Query',
      'fetchDocuments',
      { read: true }
    );

    // 2) Delete a document
    makeLambdaResolver(
      'DeleteDocumentFn',
      'deleteDocument',
      'Mutation',
      'deleteDocument',
      { write: true }
    );

    // 3) Download a document
    makeLambdaResolver(
      'DownloadDocumentFn',
      'downloadDocument',
      'Mutation',
      'downloadDocument',
      { read: true }
    );

    // 4) Outputs for your frontend
    new CfnOutput(this, 'GraphQLAPIURL', { value: api.graphqlUrl });
    new CfnOutput(this, 'GraphQLAPIKey', { value: api.apiKey! });
  }
}

const app = new cdk.App();
new RealtimeDocStack(app, 'RealtimeDocStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region:  process.env.CDK_DEFAULT_REGION,
  },
});
