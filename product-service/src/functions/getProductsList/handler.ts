import { AppError } from './../../libs/appError';
import { Client } from 'pg';
import { dbOptions } from '@functions/dboptions';
import { Product } from '@functions/types';
import { middyfy } from '@libs/lambda';
import 'source-map-support/register';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';

const getProductsList = async (): Promise<Product[]> => {
  const client = new Client(dbOptions)

  try {
    await client.connect();

    const query = `select p.id, p.title, p.description, p.price, stocks.count
                  from products as p left outer join stocks
                  on p.id = stocks.product_id;`;
    const result = await client.query(query);
    const { rows } = result;
    return rows;
  } catch (err) {
    console.log('Error during database request executing:', err);
    throw new AppError(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
  } finally {
    client.end();
  }
}

export const main = middyfy(getProductsList);
