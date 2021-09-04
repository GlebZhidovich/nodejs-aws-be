import type { AWS } from '@serverless/typescript';

import getProductsList from '@functions/getProductsList';
import getProductsById from '@functions/getProductsById';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  disabledDeprecations: [
    'CLI_OPTIONS_SCHEMA',
  ],
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack', 'serverless-offline'],
  provider: {
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
      PG_HOST: 'lesson4-database.ch4hqzfhgmw8.eu-west-1.rds.amazonaws.com',
      PG_PORT: '5432',
      PG_DATABASE: 'lesson4',
      PG_USERNAME: 'postgres',
      PG_PASSWORD: 'r4umJPELmOUSkf73lf0y'
    },
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: { getProductsList, getProductsById },

};

module.exports = serverlessConfiguration;
