import { All, Controller, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy/proxy.service';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All(':service/*')
  getHello(
    @Param('service') service: string,
    // wildcard match
    @Param('0') targetUrl: string,
    @Req() req: Request,
    @Res() res: Response,
  ): void {
    this.proxyService.proxy(service, targetUrl, req, res);
  }
}
