import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: {
    name: 'product-service',
    // app and org for use with dashboard.serverless.com
    // app: your-app-name,
    // org: your-org-name,
  },
  package: {
    include: [
      'repository/products-mock-data.json',
      'tsconfig.json'
    ],
  },
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
      // keepOutputDirectory: true,
    }
  },

  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],

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
    getProductList: {
      handler: 'handler.getProductList',
      events: [
        {
          http: {
            method: 'get',
            path: 'products',
          }
        }
      ]
    },
    getProductById: {
      handler: 'handler.getProductById',
      events: [
        {
          http: {
            method: 'get',
            path: 'products/{id}'
          }
        }
      ]
    }
  }
}

module.exports = serverlessConfiguration;
