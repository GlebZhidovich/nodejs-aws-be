import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { middyfy } from '@libs/lambda';
import 'source-map-support/register';
import { REGION } from '../constats';
import { copyAndRemoveFile, getProducts, saveToSQS } from './helpers';

const importProductsFile = async ({ Records }) => {
  const clientParams: S3ClientConfig = {
    region: REGION,
  };
  const client = new S3Client(clientParams);
  const products = await getProducts(Records, client);
  await saveToSQS(products);
  await copyAndRemoveFile(Records, client);
};

export const main = middyfy(importProductsFile);
