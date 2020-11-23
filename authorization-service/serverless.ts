import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'authorization-service',
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
    },
  },
  functions: {
    // importFileParser: {
    //   handler: 'handler.importFileParser',
    //   events: [
    //     {
    //       s3: {
    //         bucket: uploadBucketName,
    //         event: 's3:ObjectCreated:*',
    //         existing: true,
    //         rules: [{ prefix: 'upload/', suffix: '.csv' }],
    //       },
    //     },
    //   ],
    // },
  },
};

module.exports = serverlessConfiguration;
