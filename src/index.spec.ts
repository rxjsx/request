import { request } from './index';
import { RequestOptions } from './models';
import { tap } from 'rxjs/operators';
import objectContaining = jasmine.objectContaining;

describe('request', () => {
  it('GET', done => {
    const options: RequestOptions = {
      method: 'GET',
      url: 'https://httpbin.org/get',
      accept: 'json',
    };
    request(options)
      .pipe(tap(res => expect(res.json).toEqual(objectContaining({ url: 'https://httpbin.org/get' }))))
      .subscribe(_ => done());
  });

  it('POST', done => {
    const options: RequestOptions = {
      method: 'POST',
      url: 'https://httpbin.org/post',
      accept: 'json',
    };
    request(options)
      .pipe(tap(res => expect(res.json).toEqual(objectContaining({ url: 'https://httpbin.org/post' }))))
      .subscribe(_ => done());
  });

  it('POST with string body', done => {
    const options: RequestOptions = {
      method: 'POST',
      url: 'https://httpbin.org/post',
      accept: 'json',
      body: '{ "accept": false }',
    };
    request(options)
      .pipe(tap(res => expect(res.json).toEqual(objectContaining({ url: 'https://httpbin.org/post' }))))
      .subscribe(_ => done());
  });

  it('POST with JSON body', done => {
    const options: RequestOptions<{ accept: boolean }> = {
      method: 'POST',
      url: 'https://httpbin.org/post',
      accept: 'json',
      body: { accept: false },
    };
    request(options)
      .pipe(
        tap(res => {
          expect(res.statusCode).toEqual(200);
          expect(res.json).toEqual(objectContaining({ url: 'https://httpbin.org/post' }));
          expect(res.json).toEqual(objectContaining({ json: options.body }));
        }),
      )
      .pipe(tap(res => console.log(res)))
      .subscribe(_ => done());
  });
});
