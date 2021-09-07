import { Client } from 'pg';
import { Product } from '@functions/types';
import { AppError } from '@libs/appError';
import { middyfy } from '@libs/lambda';
import 'source-map-support/register';
import { dbOptions } from '@functions/dboptions';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';


const getProductsById = async ({ pathParameters }): Promise<{ product: Product }> => {
  const { productId } = pathParameters;
  const nowFoundMessage = 'Product not found';
  const client = new Client(dbOptions)

  try {
    await client.connect();

    const query = {
      text: `select p.id, p.title, p.description, p.price, stocks.count
            from products as p left outer join stocks
            on p.id = stocks.product_id where p.id = $1;`,
      values: [productId]
    };
    try {
      const result = await client.query(query);
      const { rows } = result;
      if (!rows.length) {
        throw new AppError(nowFoundMessage, StatusCodes.NOT_FOUND);
      }
      return rows;
    } catch (err) {
      throw new AppError(nowFoundMessage, StatusCodes.NOT_FOUND);
    }
  } catch (err) {
    console.log('Error during database request executing:', err);
    if (err.message === nowFoundMessage) throw new AppError(nowFoundMessage, StatusCodes.NOT_FOUND);
    throw new AppError(ReasonPhrases.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR);
  } finally {
    client.end();
  }
}

export const main = middyfy(getProductsById);
