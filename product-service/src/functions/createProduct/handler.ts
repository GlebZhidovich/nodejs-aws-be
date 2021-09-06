import { Client } from 'pg';
import { Product } from '@functions/types';
import { AppError } from '@libs/appError';
import { middyfy } from '@libs/lambda';
import 'source-map-support/register';
import { dbOptions } from '@functions/dboptions';


const createProduct = async ({ body, ...rest }): Promise<string> => {
  console.log(body);

  // const { productId } = pathParameters;

  // const client = new Client(dbOptions)
  // await client.connect();

  // try {
  //   const query = {
  //     text: `select p.id, p.title, p.description, p.price, stocks.count
  //           from products as p left outer join stocks
  //           on p.id = stocks.product_id where p.id = $1;`,
  //     values: [productId]
  //   };
  //   const result = await client.query(query);
  //   const { rows } = result;
  //   return rows;
  // } catch (err) {
  //   console.log(err);
  // } finally {
  //   client.end();
  // }
  return body;
}

export const main = middyfy(createProduct);
