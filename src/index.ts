import http from 'http';
import https from 'https';

import {
  DeleteRequestOptions,
  GetRequestOptions,
  PatchRequestOptions,
  PostRequestOptions,
  PutRequestOptions,
  RequestOptions,
  Response,
} from './models';
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

function createRequestBodyBuffer<T, R>(
  options: RequestOptions<T>,
  subscriber: Subscriber<Response<R>>,
): Buffer | undefined {
  if (typeof options.body === 'string') {
    return Buffer.from(options.body);
  }
  if (typeof options.body === 'object') {
    return Buffer.from(JSON.stringify(options.body));
  }
  subscriber.error(new Error('Unknown body type: only string and object supported'));
}

export function request<T, R>(options: RequestOptions<T>): Observable<Response<R>> {
  const url = new URL(options.url);
  const httpOptions = createHttpOptions(options, url);

  return new Observable(subscriber => {
    const req = getProtocol(url).request(httpOptions, res => handleBuffer(res, subscriber));
    req.on('error', subscriber.error);

    if (options.body) {
      const buffer = createRequestBodyBuffer(options, subscriber);
      if (!buffer) {
        req.end();
        return;
      }
      req.setHeader('content-length', buffer.length);
      req.end(buffer);
    } else {
      req.end();
    }
  });
}

/* istanbul ignore next */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace request {
  export function get<R>(url: string, headers?: Record<string, string>): Observable<Response<R>> {
    const options: GetRequestOptions = {
      method: 'GET',
      url,
      headers,
    };
    return request(options);
  }

  export function post<T, R>(url: string, body?: T, headers?: Record<string, string>): Observable<Response<R>> {
    const options: PostRequestOptions<T> = {
      method: 'POST',
      url,
      body,
      headers,
    };
    return request(options);
  }

  export function put<T, R>(url: string, body?: T, headers?: Record<string, string>): Observable<Response<R>> {
    const options: PutRequestOptions<T> = {
      method: 'PUT',
      url,
      body,
      headers,
    };
    return request(options);
  }

  export function patch<T, R>(url: string, body?: T, headers?: Record<string, string>): Observable<Response<R>> {
    const options: PatchRequestOptions<T> = {
      method: 'PATCH',
      url,
      body,
      headers,
    };
    return request(options);
  }

  export function del<R>(url: string, headers?: Record<string, string>): Observable<Response<R>> {
    const options: DeleteRequestOptions = {
      method: 'DELETE',
      url,
      headers,
    };
    return request(options);
  }
}
