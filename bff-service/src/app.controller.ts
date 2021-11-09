import {
  All,
  CACHE_MANAGER,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Method } from 'axios';
import { AppService } from './app.service';
import { Cache } from 'cache-manager';

const CACHE_TIME = 120;
@Controller('*')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @All()
  async getAll(@Req() request: Request): Promise<string> {
    const { originalUrl, method, body } = request;
    console.log('originalUrl', originalUrl);
    console.log('method', method);
    console.log('body', body);
    const [url] = originalUrl.split('?');
    const recipient = url.split('/')[1];

    const recipientURL = process.env[recipient];
    if (recipientURL) {
      const isSaveProducts = method === 'GET' && recipient === 'products';
      if (isSaveProducts) {
        const value: string = await this.cacheManager.get(originalUrl);
        if (value) {
          return value;
        }
      }

      const url = `${recipientURL}${originalUrl}`;
      const result = await this.appService.makeRequest(
        url,
        method as Method,
        body,
      );
      if (isSaveProducts) {
        await this.cacheManager.set(originalUrl, result, { ttl: CACHE_TIME });
      }
      return result;
    }
    throw new HttpException('Cannot process request', HttpStatus.BAD_GATEWAY);
  }
}
