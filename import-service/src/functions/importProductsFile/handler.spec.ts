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

const s3clientMock = mockClient(S3Client);
jest.mock('@libs/lambda');
jest.mock('@aws-sdk/s3-request-presigner');

describe('importProductsFile', () => {
  let importProductsFile;
  let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;
  let mockedGetSignedUrl: jest.MockedFunction<typeof getSignedUrl>;

  beforeEach(async () => {
    s3clientMock.reset();
    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: Handler) => {
      return handler as never;
    });
    mockedGetSignedUrl = mocked(getSignedUrl);
    mockedGetSignedUrl.mockImplementation(async () => '');
    importProductsFile = (await import('./handler')).main;
  });

  it('should return uploaded url', async () => {
    const filename = 'products.csv';
    const getObjectParams: PutObjectCommandInput = {
      Bucket: BUCKET_NAME,
      Key: `uploaded/${filename}`,
      ContentType: 'text/csv',
    };
    s3clientMock.on(PutObjectCommand).resolves(getObjectParams);
    const pathParameters = { filename };
    const actual = await importProductsFile({ pathParameters });

    expect(actual).toEqual({
      url: '',
    });
  });
});
