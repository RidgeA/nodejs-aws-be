import * as dotenv from 'dotenv';
import type { Serverless } from 'serverless/aws';

dotenv.config();

const uploadBucketName = process.env.BUCKET;

const serverlessConfiguration: Serverless = {
  service: {
    name: 'import-service',
  },
  package: {
    include: [],
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: {
        forceExclude: 'aws-sdk',
      },
      // keepOutputDirectory: true,
    },
  },

  // Add the serverless-webpack plugin
  plugins: [
    'serverless-webpack',
    'serverless-dotenv-plugin',
    'serverless-offline',
  ],

  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'eu-west-1',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SQS_QUEUE_CATALOG_ITEMS_QUEUE_REF: {
        'Fn::ImportValue': 'product-service-catalog-items-queue-ref',
      },
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: [
          `arn:aws:s3:::${uploadBucketName}`,
        ],
      },
      {
        Effect: 'Allow',
        Action: [
          's3:GetObject',
          's3:PutObject',
          's3:DeleteObject',
        ],
        Resource: [
          `arn:aws:s3:::${uploadBucketName}/*`,
        ],
      },
      {
        Effect: 'Allow',
        Action: [
          'sqs:SendMessage',
          'sqs:SendMessageBatch',
        ],
        Resource: [
          {
            "Fn::ImportValue": "product-service-catalog-items-queue-arn",
          },
        ],
      },
    ],
  },
  functions: {
    importProductsFile: {
      handler: 'handler.importProductsFile',
      events: [
        {
          http: {
            method: 'get',
            path: 'import',
            cors: true,
            request: {
              parameters: {
                querystrings: {
                  name: true,
                },
              },
            },
            authorizer: {
              name: 'basic-authorizer',
              // todo: remove hardcode
              arn: 'arn:aws:lambda:eu-west-1:625494443472:function:authorization-service-dev-basicAuthorizer:7',
            },
          },
        },
      ],
    },
    importFileParser: {
      handler: 'handler.importFileParser',
      events: [
        {
          s3: {
            bucket: uploadBucketName,
            event: 's3:ObjectCreated:*',
            existing: true,
            rules: [{ prefix: 'upload/', suffix: '.csv' }],
          },
        },
      ],
    },
  },
  resources: {
    Resources: {
      GatewayResponse4XX: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
            'gatewayresponse.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            'gatewayresponse.header.Access-Control-Allow-Methods': "'GET,OPTIONS'",
          },
          ResponseType: 'DEFAULT_4XX',
          RestApiId: {
            Ref: 'ApiGatewayRestApi',
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
