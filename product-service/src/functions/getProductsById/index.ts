import { handlerPath } from '@libs/handlerResolver';
import { AWSFunction } from '@libs/lambda';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'products/{productId}',
        cors: true,
      }
    }
  ]
} as AWSFunction
