import { middyfy } from '@libs/lambda';
import 'source-map-support/register';

const catalogBatchProcess = async ({ Records }) => {
  const products = Records.map(({ body }) => body);
  console.log(products);
};

export const main = middyfy(catalogBatchProcess);
