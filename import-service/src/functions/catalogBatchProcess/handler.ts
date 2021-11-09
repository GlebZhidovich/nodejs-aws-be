import { middyfy } from '@libs/lambda';
import { saveToDb, sendToSNS } from './helpers';
import 'source-map-support/register';

const catalogBatchProcess = async ({ Records }) => {
  const products = Records.map(({ body }) => JSON.parse(body));
  await saveToDb(products);
  await sendToSNS(products);
  console.log('products', products);
};

export const main = middyfy(catalogBatchProcess);
