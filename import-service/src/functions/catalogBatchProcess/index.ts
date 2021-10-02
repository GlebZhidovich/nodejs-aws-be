import { handlerPath } from '@libs/handlerResolver';
import { BUCKET_NAME } from '../constats';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: BUCKET_NAME,
        event: [
          {
            sqs: {
              batchSize: 2,
              arn: {
                'Fn::GetAtt': ['SQSQueue', 'Arn'],
              },
            },
          },
        ],
      },
    },
  ],
};
