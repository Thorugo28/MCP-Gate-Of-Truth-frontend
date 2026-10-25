import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../api/api-base-url';
import { apiErrorInterceptor } from './api-error.interceptor';
import { ApiError } from './http-error';

describe('apiErrorInterceptor', () => {
  it('turns a network failure into an ApiError with status 0', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://gw' },
      ],
    });
    let caught: unknown;

    TestBed.inject(HttpClient)
      .get('http://gw/admin/upstreams')
      .subscribe({ error: (e) => (caught = e) });
    TestBed.inject(HttpTestingController)
      .expectOne('http://gw/admin/upstreams')
      .error(new ProgressEvent('error'));

    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).status).toBe(0);
  });
});
