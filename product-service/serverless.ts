import dotenv from 'dotenv';
import type { Serverless } from 'serverless/aws';

dotenv.config();

const catalogItemsQueue = process.env.SQS_QUEUE_CATALOG_ITEMS_QUEUE;
const createProductTopic = process.env.SNS_TOPIC_CREATE_PRODUCT_TOPIC;
const newProductEmail = process.env.SNS_NEW_PRODUCT_SUBSCRIPTION_EMAIL;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const newProductZeroCountEmail = process.env.SNS_NEW_PRODUCT_ZERO_COUNT_SUBSCRIPTION_EMAIL;

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
  },
  package: {
    include: [],
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
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
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
          'sns:Publish',
        ],
        Resource: {
          Ref: createProductTopic,
        },
      },
    ],
  },

  functions: {
    getProductList: {
      handler: 'handler.getProductList',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
            cors: true,
          },
        },
      ],
    },
    getProductById: {
      handler: 'handler.getProductById',
      events: [
        {
          http: {
            method: 'get',
            path: 'products/{id}',
            cors: true,
          },
        },
      ],
    },
    createProduct: {
      handler: 'handler.createProduct',
      events: [
        {
          http: {
            method: 'post',
            path: 'products',
            cors: true,
          },
        },
      ],
    },
    catalogBatchProcess: {
      handler: 'handler.catalogBatchProcess',
      events: [
        {
          sqs: {
            batchSize: 5,
            arn: {
              'Fn::GetAtt': [catalogItemsQueue, 'Arn'],
            },
          },
        },
      ],
    },
  },

  resources: {
    Resources: {
      [catalogItemsQueue]: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: catalogItemsQueue,
        },
      },
      [createProductTopic]: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: createProductTopic,
        },
      },
      [`${createProductTopic}Sub`]: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: newProductEmail,
          Protocol: 'email',
          TopicArn: {
            Ref: createProductTopic,
          },
        },
      },
    },
    Outputs: {
      [`${catalogItemsQueue}Ref`]: {
        Description: "SQS Topic URL to publish exported products",
        Value: {
          'Ref': catalogItemsQueue,
        },
        Export: {
          Name: '${self:service.name}-catalog-items-queue-ref',
        },
      },
      [`${catalogItemsQueue}Arn`]: {
        Description: "SQS Topic ARN to publish exported products",
        Value: {
          'Fn::GetAtt': [catalogItemsQueue, 'Arn'],
        },
        Export: {
          Name: '${self:service.name}-catalog-items-queue-arn',
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
