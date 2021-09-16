import http from 'http';
import https from 'https';

import { RequestOptions, Response } from './models';
import { Observable, Subscriber } from 'rxjs';
import { URL } from 'url';
import { type } from 'os';

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

function acceptResponse<R>(
  data: string,
  res: http.IncomingMessage,
  acceptJson: boolean,
  subscriber: Subscriber<Response<R>>,
) {
  const response: Response<R> = { body: data, statusCode: res.statusCode };
  if (acceptJson) {
    response.json = JSON.parse(data);
  }
  subscriber.next(response);
  subscriber.complete();
}

function handleBuffer<R>(res: http.IncomingMessage, subscriber: Subscriber<Response<R>>, acceptJson: boolean): void {
  const parts: any[] | Uint8Array[] = [];
  res.on('error', subscriber.error);
  res.on('data', data => {
    parts.push(data);
  });
  res.on('end', () => {
    const data = Buffer.concat(parts).toString();
    acceptResponse(data, res, acceptJson, subscriber);
  });
}

function handleData<R>(res: http.IncomingMessage, subscriber: Subscriber<Response<R>>, acceptJson: boolean): void {
  res.on('error', subscriber.error);
  res.on('data', data => {
    acceptResponse(data, res, acceptJson, subscriber);
  });
}

export function request<T, R>(options: RequestOptions<T>): Observable<Response<R>> {
  const url = new URL(options.url);
  const httpOptions = createHttpOptions(options, url);
  const acceptJson = options.accept === 'json';

  return new Observable(subscriber => {
    const req = getProtocol(url).request(httpOptions, res => {
      if (options.method === 'GET') {
        handleData(res, subscriber, acceptJson);
      } else {
        handleBuffer(res, subscriber, acceptJson);
      }
    });
    req.on('error', subscriber.error);

    if (options.body) {
      let buffer = undefined;
      if (typeof options.body === 'string') {
        buffer = Buffer.from(options.body);
      } else if (typeof options.body === 'object') {
        buffer = Buffer.from(JSON.stringify(options.body));
      } else {
        subscriber.error(new Error('Unknown body type: only string and object supported'));
      }
      if (buffer) {
        req.setHeader('content-length', buffer.length);
        req.end(buffer);
      }
    }
    req.end();
  });
}
