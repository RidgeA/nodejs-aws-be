import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as LRU from 'lru-cache';

interface CacheEntry {
  headers: Record<string, number | string | string[]>;
  statusCode: number;
  body: Buffer;
}

const cache = new LRU({
  max: 10 * 2 ** 20, // 10 Mb
  length(value: CacheEntry, key?: string): number {
    // todo: more accurate size computation, ignoring headers/status code for now
    return value.body.length + key.length;
  },
  maxAge: 2 * 60 * 1000, // 2 minutes
});

const getCacheKey = (req: Request): string => {
  return `${req.originalUrl}${req.header('Authorization')}`;
};

const doNotCacheUrls = ['/import'];

const allowedToCacheRequest = (req): boolean => {
  if (req.method !== 'GET') {
    return false;
  }

  for (const url of doNotCacheUrls) {
    if (req.originalUrl.startsWith(url)) {
      return false;
    }
  }

  return true;
};

const allowedToCacheResponse = (res): boolean => {
  switch (true) {
    case 200 <= res.statusCode && res.statusCode <= 299:
    case [401, 403, 404].includes(res.statusCode): {
      return true;
    }
    default:
      return false;
  }
};

const sendCachedResponse = (res: Response, ce: CacheEntry) => {
  res.statusCode = ce.statusCode;
  for (const [key, value] of Object.entries(ce.headers)) {
    res.setHeader(key, value as string);
  }
  res.setHeader('x-bff-cache-hit', 'true');
  res.send(ce.body);
};

const storeResponseFromUpstream = (key: string, res: Response) => {
  const chunks = [];

  res.on('pipe', async (reader) => {
    if (!allowedToCacheResponse(res)) {
      return;
    }

    for await (const chunk of reader) {
      chunks.push(chunk);
    }

    const cacheEntry: CacheEntry = {
      body: Buffer.concat(chunks),
      statusCode: res.statusCode,
      headers: res.getHeaders(),
    };

    cache.set(key, cacheEntry);
  });
};

@Injectable()
export class CacheMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const key = getCacheKey(req);

    const ce = cache.get(key);
    if (ce) {
      sendCachedResponse(res, ce);
      return;
    }

    if (allowedToCacheRequest(req)) {
      storeResponseFromUpstream(key, res);
    }

    return next();
  }
}
