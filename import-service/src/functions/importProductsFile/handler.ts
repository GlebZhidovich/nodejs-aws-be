import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import 'source-map-support/register';

const BUCKET_NAME = 'import-service-bucket-app';

const importProductsFile = async ({
  pathParameters,
}): Promise<{ url: string }> => {
  const { filename } = pathParameters;
  const clientParams: S3ClientConfig = {
    region: 'eu-west-1',
  };
  const getObjectParams: PutObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: `uploaded/${filename}`,
    ContentType: 'text/csv',
  };
  const client = new S3Client(clientParams);
  const command = new PutObjectCommand(getObjectParams);
  const url = await getSignedUrl(client, command, { expiresIn: 60 });
  return { url };
};

export const main = middyfy(importProductsFile);
