import http from 'http';
import https from 'https';

import { RequestOptions, Response } from './models';
import { Observable } from 'rxjs';
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

  if (options.accept === 'json') {
    httpOptions.headers['Accept'] = 'application/json';
  }

  return httpOptions;
}

export function request<T, R>(options: RequestOptions<T>): Observable<Response<R>> {
  const url = new URL(options.url);
  const httpOptions = createHttpOptions(options, url);
  const acceptJson = options.accept === 'json';

  return new Observable(subscriber => {
    const req = getProtocol(url).request(httpOptions, res => {
      res.on('data', data => {
        subscriber.next(acceptJson ? JSON.parse(data) : data);
        subscriber.complete();
      });
      res.on('error', error => {
        subscriber.error(error);
      });
    });
    req.on('error', subscriber.error);
    req.end();
  });
}
