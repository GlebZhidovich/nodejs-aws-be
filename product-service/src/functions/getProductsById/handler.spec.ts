import { AppError } from '@libs/appError';
import { productList } from './../productList';
import { mocked } from 'ts-jest/utils';
import { Handler } from 'aws-lambda';

import { middyfy } from '@libs/lambda';

jest.mock('@libs/lambda');

describe('getProductsList', () => {
  let products;
  let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;

  beforeEach(async () => {
    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: Handler) => {
      return handler as never;
    });

    products = (await import('./handler')).main;
  });

  it('should return Product object', async () => {
    const productId = '7567ec4b-b10c-48c5-9345-fc73c48a80a2';
    const event = {
      pathParameters: {
        productId
      }
    }
    const actual = await products(event);
    const product = productList.find(product => product.id === productId);
    expect(actual).toEqual({
      product
    });
  });

  it('should return AppError object', async () => {
    const productId = '';
    const event = {
      pathParameters: {
        productId
      }
    }
    try {
      await products(event);
    } catch (error) {
      const appError = new AppError('Product not found', 404);
      expect(error).toEqual(appError);
    }
  });

});