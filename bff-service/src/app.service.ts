import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosError, AxiosResponse, Method, AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private httpService: HttpService) {}

  async makeRequest(url: string, method: Method, body: any): Promise<string> {
    const config: AxiosRequestConfig = {
      url,
      method,
    };

    if (Object.keys(body).length) {
      config.data = body;
    }

    const request$ = this.httpService
      .request(config)
      .pipe(map((res) => res.data));

    try {
      const response: AxiosResponse = await lastValueFrom(request$);
      return JSON.stringify(response.data ? response.data : response, null, 2);
    } catch (err) {
      const error = (err as AxiosError).response;
      throw new HttpException(error.statusText, error.status);
    }
  }
}
