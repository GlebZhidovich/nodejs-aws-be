import { middyfy } from '@libs/lambda';
import { Handler } from 'aws-lambda';
import { mocked } from 'ts-jest/utils';
import { saveToDb, sendToSNS } from './helpers';

jest.mock('@libs/lambda');
jest.mock('./helpers');

describe('catalogBatchProcess', () => {
  let catalogBatchProcess;
  let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;
  let mockSaveToDb: jest.MockedFunction<typeof saveToDb>;
  let mockSendToSNS: jest.MockedFunction<typeof sendToSNS>;
  const products = [];

  beforeEach(async () => {
    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: Handler) => {
      return handler as never;
    });
    mockSaveToDb = mocked(saveToDb);
    mockSendToSNS = mocked(sendToSNS);
    catalogBatchProcess = (await import('./handler')).main;
  });

  it('should call saveToDb, sendToSNS', async () => {
    await catalogBatchProcess({ Records: products });

    expect(mockSaveToDb).toHaveBeenCalledTimes(1);
    expect(mockSendToSNS).toHaveBeenCalledTimes(1);
  });

  it('should call with empty array', async () => {
    await catalogBatchProcess({ Records: products });

    expect(mockSaveToDb).toHaveBeenCalledWith(products);
    expect(mockSendToSNS).toHaveBeenCalledWith(products);
  });
});
