import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AccessKeyApi } from './access-key.api';
import { API_BASE_URL } from './api-base-url';

describe('AccessKeyApi', () => {
  it('tests a key against GET /admin/upstreams with that key', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://gw' },
      ],
    });
    let done = false;
    TestBed.inject(AccessKeyApi)
      .verify('k1')
      .subscribe(() => (done = true));

    const req = TestBed.inject(HttpTestingController).expectOne('http://gw/admin/upstreams');
    expect(req.request.headers.get('Authorization')).toBe('Bearer k1');
    req.flush([]);
    expect(done).toBe(true);
  });
});
