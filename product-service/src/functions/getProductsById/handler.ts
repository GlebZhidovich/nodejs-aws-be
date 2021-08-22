import { Product } from '@functions/types';
import { AppError } from '@libs/appError';
import { middyfy } from '@libs/lambda';
import 'source-map-support/register';
import { productList } from "../productList";


const getProductsById = async ({ pathParameters }): Promise<{ product: Product }> => {
  const { productId } = pathParameters;
  const product = productList.find(product => product.id === productId);

  if (product) {
    return {
      product
    }
  }

  throw new AppError('Product not found', 404);
}

export const main = middyfy(getProductsById);
