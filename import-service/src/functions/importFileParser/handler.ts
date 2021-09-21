import { middyfy } from '@libs/lambda';
import 'source-map-support/register';
import {
  GetObjectCommand,
  GetObjectCommandInput,
  CopyObjectCommand,
  CopyObjectCommandInput,
  S3ClientConfig,
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { BUCKET_NAME } from '../constats';
import csv from 'csv-parser';
import { Client } from 'pg';
import { dbOptions } from '../dboptions';
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

const saveToDb = async (products: Product[]) => {
  const client = new Client(dbOptions);
  try {
    await client.connect();

    for (const product of products) {
      const { title, description, price } = product;
      const query = {
        text: `insert into products (title, description, price) values
                ($1, $2, $3)`,
        values: [title, description, price],
      };
      await client.query(query);
      console.log(product);
    }
  } catch (err) {
    console.log(err);
  } finally {
    client.end();
  }
};

const copyAndremoveFile = async (records, client) => {
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
    region: 'eu-west-1',
  };
  const client = new S3Client(clientParams);
  const products = await getProducts(Records, client);
  await saveToDb(products);
  await copyAndremoveFile(Records, client);
};

export const main = middyfy(importProductsFile);
