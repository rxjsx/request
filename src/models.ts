export type MethodType = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions<T = string, M extends MethodType = MethodType> {
  method: MethodType;
  url: string;
  body?: T;
  headers?: Record<string, string>;
  accept?: string;
}

export type GetRequestOptions = Omit<RequestOptions<any, 'GET'>, 'body'>;
export type PutRequestOptions<T> = RequestOptions<T, 'PUT'>;
export type PostRequestOptions<T> = RequestOptions<T, 'POST'>;
export type PatchRequestOptions<T> = RequestOptions<T, 'PATCH'>;
export type DeleteRequestOptions = Omit<RequestOptions<any, 'DELETE'>, 'body'>;

export interface Response<R = string> {
  statusCode: number;
  body: R;
}
