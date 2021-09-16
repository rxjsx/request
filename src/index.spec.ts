import { request } from './index';
import { RequestOptions } from './models';
import { tap } from 'rxjs/operators';

describe('request', () => {
  it('GET', done => {
    const options: RequestOptions = {
      method: 'GET',
      url: 'https://httpbin.org/get',
      accept: 'json',
    };
    request(options)
      .pipe(tap(console.log))
      .subscribe(_ => done());
  });
});
