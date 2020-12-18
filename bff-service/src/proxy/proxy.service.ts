import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { createProxy } from 'http-proxy';

@Injectable()
export class ProxyService {
  constructor(private readonly config: ConfigService) {}

  proxy(service: string, targetUrl: string, req: Request, res: Response) {
    const upstreamUrl = this.lookupUpstreamUrl(service);
    const target = `${upstreamUrl}/${targetUrl}`;
    const proxy = createProxy();
    proxy.on('error', (err) => {
      // shallow errors, happens for aborted requests
      if (err.code === 'ECONNRESET') {
        return;
      }
      throw err;
    });
    proxy.web(req, res, {
      target,
      changeOrigin: true,
    });
  }

  private lookupUpstreamUrl(service: string) {
    return this.config.get<string>(service);
  }
}
