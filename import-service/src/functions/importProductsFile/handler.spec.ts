import { middyfy } from '@libs/lambda';
import { Handler } from 'aws-lambda';
import { mocked } from 'ts-jest/utils';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { mockClient } from 'aws-sdk-client-mock';
import {
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { BUCKET_NAME } from '../constats';
import { AppError } from '../../libs/appError';

const s3clientMock = mockClient(S3Client);
jest.mock('@libs/lambda');
jest.mock('@aws-sdk/s3-request-presigner');

describe('importProductsFile', () => {
  let importProductsFile;
  let checkIsCsvFile;
  let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;
  let mockedGetSignedUrl: jest.MockedFunction<typeof getSignedUrl>;
  const filename = 'products.csv';
  const wrongFilename = 'products.txt';

  const getObjectParams: PutObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: `uploaded/${filename}`,
    ContentType: 'text/csv',
  };

  beforeEach(async () => {
    s3clientMock.reset();
    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: Handler) => {
      return handler as never;
    });
    mockedGetSignedUrl = mocked(getSignedUrl);
    mockedGetSignedUrl.mockImplementation(async () => '');
    importProductsFile = (await import('./handler')).main;
    checkIsCsvFile = (await import('./handler')).checkIsCsvFile;
  });

  it('check csv file type', () => {
    const actual = checkIsCsvFile(filename);

    expect(actual).toBeTruthy();
  });

  it('check is not csv file type', () => {
    const actual = checkIsCsvFile(wrongFilename);

    expect(actual).toBeFalsy();
  });

  it('should return uploaded url', async () => {
    s3clientMock.on(PutObjectCommand).resolves(getObjectParams);
    const pathParameters = { filename };
    const actual = await importProductsFile({ pathParameters });

    expect(actual).toEqual({
      url: '',
    });
  });

  it('should return AppError', async () => {
    s3clientMock.on(PutObjectCommand).resolves(getObjectParams);
    const pathParameters = { filename: wrongFilename };
    try {
      await importProductsFile({ pathParameters });
    } catch (error) {
      expect(error).toEqual(new AppError('Wrong file format', 400));
    }
  });
});
