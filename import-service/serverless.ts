import type { AWS } from '@serverless/typescript';

import importProductsFile from '@functions/importProductsFile';
import importFileParser from '@functions/importFileParser';
import catalogBatchProcess from '@functions/catalogBatchProcess';

const serverlessConfiguration: AWS = {
  service: 'import-service',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack', 'serverless-offline'],
  provider: {
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 's3:ListBucket',
        Resource: 'arn:aws:s3:::import-service-bucket-app',
      },
      {
        Effect: 'Allow',
        Action: 's3:*',
        Resource: 'arn:aws:s3:::import-service-bucket-app/*',
      },
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: [
          {
            'Fn::GetAtt': ['SQSQueue', 'Arn'],
          },
        ],
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: {
          Ref: 'SNSTopic',
        },
      },
    ],
    name: 'aws',
    runtime: 'nodejs14.x',
    region: 'eu-west-1',
    stage: 'dev',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',

      SQS_URL: {
        Ref: 'SQSQueue',
      },
      SNS_ARN: {
        Ref: 'SNSTopic',
      },
    },
    lambdaHashingVersion: '20201221',
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'catalogItemsQueue',
        },
      },
      SNSTopic: {
        Type: 'AWS::SNS::Topic',
        Properties: {
          TopicName: 'createProductTopic',
        },
      },
      SNSSubscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: '5925520@gmail.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSTopic',
          },
          FilterPolicy: {
            product_price: [{ numeric: ['>', 30] }],
          },
        },
      },
      SNS2Subscription: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: '3696732@mail.ru',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSTopic',
          },
          FilterPolicy: {
            product_price: [{ numeric: ['<', 30] }],
          },
        },
      },
    },
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser, catalogBatchProcess },
};

module.exports = serverlessConfiguration;
