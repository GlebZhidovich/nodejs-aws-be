import {
  All,
  Controller,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Method } from 'axios';
import { AppService } from './app.service';

@Controller('*')
export class AppController {
  constructor(private readonly appService: AppService) {}

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
      const url = `${recipientURL}${originalUrl}`;
      return this.appService.makeRequest(url, method as Method, body);
    }
    throw new HttpException('Cannot process request', HttpStatus.BAD_GATEWAY);
  }
}
