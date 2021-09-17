export type MethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions<T = string, M extends MethodType = MethodType> {
  method: M;
  url: string;
  body?: T;
  headers?: Record<string, string>;
}

export type GetRequestOptions = Omit<RequestOptions<unknown, 'GET'>, 'body'>;
export type PutRequestOptions<T> = RequestOptions<T, 'PUT'>;
export type PostRequestOptions<T> = RequestOptions<T, 'POST'>;
export type PatchRequestOptions<T> = RequestOptions<T, 'PATCH'>;
export type DeleteRequestOptions = Omit<RequestOptions<unknown, 'DELETE'>, 'body'>;

export class Response<R = string> {
  constructor(public body: string, public statusCode?: number) {}
  json(): R {
    return JSON.parse(this.body);
  }
}
