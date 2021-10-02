import { handlerPath } from '@libs/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      sqs: {
        batchSize: 2,
        arn: {
          'Fn::GetAtt': ['SQSQueue', 'Arn'],
        },
      },
    },
  ],
};
