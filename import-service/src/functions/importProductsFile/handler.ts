import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { middyfy } from '@libs/lambda';
import 'source-map-support/register';
import { AppError } from '../../libs/appError';
import { BUCKET_NAME } from '../constats';

export const checkIsCsvFile = (filename: string): boolean => {
  const arrNames = filename.split('.');
  return arrNames[arrNames.length - 1] === 'csv';
};

const importProductsFile = async ({
  pathParameters,
}): Promise<{ url: string }> => {
  const { filename } = pathParameters;
  if (!checkIsCsvFile(filename)) {
    throw new AppError('Wrong file format', 400);
  }
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
