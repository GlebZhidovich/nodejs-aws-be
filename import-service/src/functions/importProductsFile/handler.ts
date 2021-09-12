import 'source-map-support/register';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import { GetObjectCommand, GetObjectCommandInput, S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = 'import-service-bucket-app';

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<object> = async ({ pathParameters }) => {

  try {
    const { fileName } = pathParameters;
    const clientParams: S3ClientConfig = {
      region: "eu-west-1"
    }
    const getObjectParams: GetObjectCommandInput = {
      Bucket: BUCKET_NAME,
      Key: `uploaded/${fileName}.csv`,
    }
    const client = new S3Client(clientParams);
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(client, command, { expiresIn: 600 });

    return formatJSONResponse({
      url,
    });
  } catch (err) {
    return formatJSONResponse({
      error: err.message,
    }, 500);
  }

}

export const main = middyfy(importProductsFile);
