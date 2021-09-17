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

  it('get', done => {
    request
      .get('https://httpbin.org/get')
      .pipe(tap(res => expect(res.json()).toEqual(objectContaining({ url: 'https://httpbin.org/get' }))))
      .subscribe(acceptOneCall('get'), fail, done);
  });

  it('post', done => {
    request
      .post('https://httpbin.org/post')
      .pipe(tap(res => expect(res.json()).toEqual(objectContaining({ url: 'https://httpbin.org/post' }))))
      .subscribe(acceptOneCall('post'), fail, done);
  });

  it('post with string body', done => {
    request
      .post('https://httpbin.org/post', '{ "accept": false }')
      .pipe(tap(res => expect(res.json()).toEqual(objectContaining({ url: 'https://httpbin.org/post' }))))
      .subscribe(acceptOneCall('post string'), fail, done);
  });

  it('post with JSON body', done => {
    const body = { accept: false };
    request
      .post('https://httpbin.org/post', body)
      .pipe(
        tap(res => {
          expect(res.statusCode).toEqual(200);
          expect(res.json()).toEqual(objectContaining({ url: 'https://httpbin.org/post' }));
          expect(res.json()).toEqual(objectContaining({ json: body }));
        }),
      )
      .subscribe(acceptOneCall('post JSON'), fail, done);
  });

  it('put with JSON body', done => {
    const body = { accept: false };
    request
      .put('https://httpbin.org/put', body)
      .pipe(
        tap(res => {
          expect(res.statusCode).toEqual(200);
          expect(res.json()).toEqual(objectContaining({ url: 'https://httpbin.org/put' }));
          expect(res.json()).toEqual(objectContaining({ json: body }));
        }),
      )
      .subscribe(acceptOneCall('put JSON'), fail, done);
  });

  it('patch with JSON body', done => {
    const body = { accept: false };
    request
      .patch('https://httpbin.org/patch', body)
      .pipe(
        tap(res => {
          expect(res.statusCode).toEqual(200);
          expect(res.json()).toEqual(objectContaining({ url: 'https://httpbin.org/patch' }));
          expect(res.json()).toEqual(objectContaining({ json: body }));
        }),
      )
      .subscribe(acceptOneCall('patch JSON'), fail, done);
  });

  it('del', done => {
    request
      .del('https://httpbin.org/delete')
      .pipe(
        tap(res => {
          expect(res.statusCode).toEqual(200);
          expect(res.json()).toEqual(objectContaining({ url: 'https://httpbin.org/delete' }));
        }),
      )
      .subscribe(acceptOneCall('del'), fail, done);
  });
});
