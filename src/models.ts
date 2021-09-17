export type MethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions<T = unknown, M extends MethodType = MethodType> {
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

export class Response<R = unknown> {
  private _json?: R;
  constructor(public body: string, public statusCode?: number) {}
  json(): R {
    if (this._json !== undefined) {
      return this._json;
    }
    const parsed = JSON.parse(this.body);
    this._json = parsed;
    return parsed;
  }
}
