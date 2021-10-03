import {
  PublishCommand,
  PublishCommandInput,
  SNSClient,
} from '@aws-sdk/client-sns';
import { middyfy } from '@libs/lambda';
import Joi from 'joi';
import { Client } from 'pg';
import 'source-map-support/register';
import { AppError } from '../../libs/appError';
import { REGION } from '../constats';
import { dbOptions } from '../dboptions';
import { Product } from '../types';

const saveToDb = async (products: Product[]) => {
  const client = new Client(dbOptions);
  try {
    await client.connect();

    await client.query('BEGIN');
    for (const product of products) {
      const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
      });
      const { error } = schema.validate(product);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const { title, description, price } = product;

      const query = {
        text: `insert into products (title, description, price) values
                ($1, $2, $3)`,
        values: [title, description, price],
      };
      await client.query(query);
      console.log('productDB', product);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    throw err;
  } finally {
    client.end();
  }
};

const sendToSNS = async (products: Product[]) => {
  const client = new SNSClient({ region: REGION });
  for (const product of products) {
    const input: PublishCommandInput = {
      Subject: 'Product has been added to DB',
      Message: JSON.stringify(product),
      TopicArn: process.env.SNS_ARN,
    };
    const command = new PublishCommand(input);
    const response = await client.send(command);
    console.log('responseSNS', response);
  }
};

const catalogBatchProcess = async ({ Records }) => {
  const products = Records.map(({ body }) => JSON.parse(body));
  await saveToDb(products);
  await sendToSNS(products);
  console.log('products', products);
};

export const main = middyfy(catalogBatchProcess);
