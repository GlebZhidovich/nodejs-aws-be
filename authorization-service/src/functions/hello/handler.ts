import { middyfy } from '@libs/lambda';
import { Handler } from 'aws-lambda';
import 'source-map-support/register';
import { formatJSONResponse } from '../../libs/apiGateway';

const basicAuthorizer: Handler = async () => {
  return formatJSONResponse({
    message: 'Hello',
  });
};

export const main = middyfy(basicAuthorizer);
