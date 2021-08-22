import { Product } from '@functions/types';
import { middyfy } from '@libs/lambda';
import 'source-map-support/register';
import { productList } from './../productList';


const getProductsList = async (): Promise<{ productList: Product[] }> => {
  return {
    productList
  };
}

export const main = middyfy(getProductsList);
