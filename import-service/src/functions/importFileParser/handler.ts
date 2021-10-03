import {
  CopyObjectCommand,
  CopyObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  GetObjectCommand,
  GetObjectCommandInput,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import {
  SendMessageCommand,
  SendMessageCommandInput,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { middyfy } from '@libs/lambda';
import csv from 'csv-parser';
import 'source-map-support/register';
import { BUCKET_NAME, REGION } from '../constats';
import { Product } from '../types';

const streamToArray = (stream): any =>
  new Promise((resolve, reject) => {
    const reuslt = [];
    stream
      .pipe(csv())
      .on('data', (data) => reuslt.push(data))
      .on('error', reject)
      .on('end', () => resolve(reuslt));
  });

const getProducts = async (records, client): Promise<Product[]> => {
  for (const record of records) {
    const getObjectParams: GetObjectCommandInput = {
      Bucket: BUCKET_NAME,
      Key: record.s3.object.key,
    };

    const getCommand = new GetObjectCommand(getObjectParams);

    const response = await client.send(getCommand);
    return streamToArray(response.Body);
  }
};

const saveToSQS = async (products: Product[]) => {
  const client = new SQSClient({ region: REGION });

  for (const product of products) {
    const input: SendMessageCommandInput = {
      QueueUrl: process.env.SQS_URL,
      MessageBody: JSON.stringify(product),
    };
    const command = new SendMessageCommand(input);
    const response = await client.send(command);
    console.log('response', response);
  }
};

const copyAndRemoveFile = async (records, client) => {
  for (const record of records) {
    const copyObjectParams: CopyObjectCommandInput = {
      Bucket: BUCKET_NAME,
      Key: record.s3.object.key.replace('uploaded', 'parsed'),
      CopySource: BUCKET_NAME + '/' + record.s3.object.key,
    };

    const deleteObjectParams: DeleteObjectCommandInput = {
      Bucket: BUCKET_NAME,
      Key: record.s3.object.key,
    };

    const copyCommand = new CopyObjectCommand(copyObjectParams);
    const deleteCommand = new DeleteObjectCommand(deleteObjectParams);
    await client.send(copyCommand);
    await client.send(deleteCommand);
  }
};

const importProductsFile = async ({ Records }) => {
  const clientParams: S3ClientConfig = {
    region: REGION,
  };
  const client = new S3Client(clientParams);
  const products = await getProducts(Records, client);
  // await saveToDb(products);
  await saveToSQS(products);
  await copyAndRemoveFile(Records, client);
};

export const main = middyfy(importProductsFile);
