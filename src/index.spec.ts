import { request } from './index';
import { RequestOptions, Response } from './models';
import { tap } from 'rxjs/operators';
import objectContaining = jasmine.objectContaining;

describe('request', () => {
  const alreadyCalled: string[] = [];

  function acceptOneCall<T extends Response<unknown>>(key: string) {
    return (_: T) => {
      if (alreadyCalled.includes(key)) {
        fail(`The key ${key} is called more than once`);
      }
      alreadyCalled.push(key);
    };
  }

  it('GET FTP', done => {
    const options: RequestOptions = {
      method: 'GET',
      url: 'ftp://httpbin.org/get',
    };
    request(options).subscribe(fail, error => {
      expect(error).toEqual(new Error('Unknown protocol ftp:'));
      done();
    });
  });

  it('GET HTTP', done => {
    const options: RequestOptions = {
      method: 'GET',
      url: 'http://httpbin.org/get',
    };
    request(options)
      .pipe(tap(res => expect(res.json()).toEqual(objectContaining({ url: 'http://httpbin.org/get' }))))
      .subscribe(acceptOneCall('GET HTTP'), fail, done);
  });

  it('GET', done => {
    const options: RequestOptions = {
      method: 'GET',
      url: 'https://httpbin.org/get',
    };
    request(options)
      .pipe(tap(res => expect(res.json()).toEqual(objectContaining({ url: 'https://httpbin.org/get' }))))
      .subscribe(acceptOneCall('GET'), fail, done);
  });

  it('POST', done => {
    const options: RequestOptions = {
      method: 'POST',
      url: 'https://httpbin.org/post',
    };
    request(options)
      .pipe(tap(res => expect(res.json()).toEqual(objectContaining({ url: 'https://httpbin.org/post' }))))
      .subscribe(acceptOneCall('POST'), fail, done);
  });

  it('POST with string body', done => {
    const options: RequestOptions = {
      method: 'POST',
      url: 'https://httpbin.org/post',
      body: '{ "accept": false }',
    };
    request(options)
      .pipe(tap(res => expect(res.json()).toEqual(objectContaining({ url: 'https://httpbin.org/post' }))))
      .subscribe(acceptOneCall('POST string'), fail, done);
  });

  it('POST with JSON body', done => {
    const options: RequestOptions<{ accept: boolean }> = {
      method: 'POST',
      url: 'https://httpbin.org/post',
      body: { accept: false },
    };
    request(options)
      .pipe(
        tap(res => {
          expect(res.statusCode).toEqual(200);
          expect(res.json()).toEqual(objectContaining({ url: 'https://httpbin.org/post' }));
          expect(res.json()).toEqual(objectContaining({ json: options.body }));
        }),
      )
      .subscribe(acceptOneCall('POST JSON'), fail, done);
  });

  it('POST with invalid body', done => {
    const options: RequestOptions<{ accept: boolean }> = {
      method: 'POST',
      url: 'https://httpbin.org/post',
      accept: 'json',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      body: true,
    };
    request(options).subscribe(fail, error => {
      expect(error).toEqual(new Error('Unknown body type: only string and object supported'));
      done();
    });
  });
});
