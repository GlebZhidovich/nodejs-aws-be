import { dbOptions } from '@functions/dboptions';
import { Product } from '@functions/types';
import { AppError } from '@libs/appError';
import { middyfy } from '@libs/lambda';
import {
  ReasonPhrases,
  StatusCodes
} from 'http-status-codes';
import { Client } from 'pg';
import 'source-map-support/register';
import { v4 as uuidv4 } from 'uuid';

const createProduct = async ({ body }: { body: Product }): Promise<string> => {
  const client = new Client(dbOptions);
  try {
    await client.connect();

    const { id: productId, title, description, price, count } = body;
    const id = productId || uuidv4();

    await client.query('BEGIN');
    const queryProduct = {
      text: `insert into products (id, title, description, price) values
              ($1, $2, $3, $4)`,
      values: [id, title, description, price]
    };
    await client.query(queryProduct);
    const queryStock = {
      text: `insert into stocks (product_id, count) values
              ($1, $2)`,
      values: [id, count]
    };
    await client.query(queryStock);
    await client.query('COMMIT');
    return id;
  } catch (err) {
    await client.query('ROLLBACK');
    console.log('Error during database request executing:', err);
    throw new AppError(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
  } finally {
    client.end();
  }
}

export const main = middyfy(createProduct);
