# RxJSx Request
[![Tests](https://github.com/rxjsx/request/actions/workflows/node.yml/badge.svg)](https://github.com/rxjsx/request/actions/workflows/node.yml)
[![Coverage Status](https://coveralls.io/repos/github/rxjsx/request/badge.svg?branch=master)](https://coveralls.io/github/rxjsx/request?branch=master)
[![NPM Version](https://img.shields.io/npm/v/@rxjsx/request)](https://www.npmjs.com/package/@rxjsx/request)
[![NPM Bundle Size](https://badgen.net/bundlephobia/minzip/@rxjsx/request)](https://bundlephobia.com/package/@rxjsx/request@latest)

A simple RxJS-based HTTP client

## Install
```bash
npm install --save @rxjsx/request rxjs
```

The library RxJS is a peer dependency. The library is tested with RxJS v6 and v7.

## Usage

### TypeScript + RxJS
```typescript
import { request } from '@rxjsx/request';

interface GitHubAPIList {
  current_user_url: string;
}

request.get<GitHubAPIList>('https://api.github.com/')
  .subscribe(response => {
    const list: GitHubAPIList = response.json();
    console.log(list.current_user_url);
  });
```

### JavaScript + Await
```typescript
const { request } = require("@rxjsx/request");

const response = await request
  .get('https://httpbin.org/get')
  .toPromise();
console.log(response.json());
```
Try it here: https://runkit.com/aerabi/rxjsx-request-await

## API
```typescript
export declare function request<T, R>(options: RequestOptions<T>): Observable<Response<R>>;
export declare namespace request {
  function get<R>(url: string, headers?: Record<string, string>): Observable<Response<R>>;
  function post<T, R>(url: string, body?: T, headers?: Record<string, string>): Observable<Response<R>>;
  function put<T, R>(url: string, body?: T, headers?: Record<string, string>): Observable<Response<R>>;
  function patch<T, R>(url: string, body?: T, headers?: Record<string, string>): Observable<Response<R>>;
  function del<R>(url: string, headers?: Record<string, string>): Observable<Response<R>>;
}
```

## Notes
- The functions return a _singleton_ observable, meaning that the observable will
  contain one element (otherwise would error out).
