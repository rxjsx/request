import http from 'http';
import https from 'https';

import { RequestOptions, Response } from './models';
import { Observable, Subscriber } from 'rxjs';
import { URL } from 'url';

function getProtocol(url: URL): typeof http | typeof https {
  if (url.protocol === 'http:') {
    return http;
  }
  if (url.protocol === 'https:') {
    return https;
  }
  throw new Error(`Unknown protocol ${url.protocol}`);
}

function createHttpOptions<T>(options: RequestOptions<T>, url: URL): https.RequestOptions {
  const httpOptions = {
    method: options.method,
    path: `${url.pathname}${url.search}`,
    port: url.port,
    hostname: url.hostname,
    headers: options.headers || {},
  };

  httpOptions.headers['Accept'] = 'application/json';

  return httpOptions;
}

function acceptResponse<R>(data: string, res: http.IncomingMessage, subscriber: Subscriber<Response<R>>) {
  const response: Response<R> = new Response<R>(data, res.statusCode);
  subscriber.next(response);
  subscriber.complete();
}

function handleBuffer<R>(res: http.IncomingMessage, subscriber: Subscriber<Response<R>>): void {
  const parts: Uint8Array[] = [];
  res.on('error', subscriber.error);
  res.on('data', data => {
    parts.push(data);
  });
  res.on('end', () => {
    const data = Buffer.concat(parts).toString();
    acceptResponse(data, res, subscriber);
  });
}

function createRequestBodyBuffer<T>(options: RequestOptions<T>): Buffer {
  if (typeof options.body === 'string') {
    return Buffer.from(options.body);
  }
  if (typeof options.body === 'object') {
    return Buffer.from(JSON.stringify(options.body));
  }
  throw new Error('Unknown body type: only string and object supported');
}

export function request<T, R>(options: RequestOptions<T>): Observable<Response<R>> {
  const url = new URL(options.url);
  const httpOptions = createHttpOptions(options, url);

  return new Observable(subscriber => {
    const req = getProtocol(url).request(httpOptions, res => handleBuffer(res, subscriber));
    req.on('error', subscriber.error);

    if (options.body) {
      const buffer = createRequestBodyBuffer(options);
      req.setHeader('content-length', buffer.length);
      req.end(buffer);
    } else {
      req.end();
    }
  });
}
