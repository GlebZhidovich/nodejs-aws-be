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

  afterEach(() => {
    jest.resetModules();
  });

  it('should return ProductList object', async () => {
    const actual = await products();
    expect(actual).toEqual({
      productList
    });
  });
});