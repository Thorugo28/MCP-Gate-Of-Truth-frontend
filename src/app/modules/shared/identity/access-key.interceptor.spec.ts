import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { API_BASE_URL } from '../core/api/api-base-url';
import { apiErrorInterceptor } from '../core/http/api-error.interceptor';
import { accessKeyInterceptor } from './access-key.interceptor';
import { AccessKeyService } from './access-key.service';

describe('accessKeyInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let accessKey: AccessKeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([accessKeyInterceptor, apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://gw' },
      ],
    });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    accessKey = TestBed.inject(AccessKeyService);
    accessKey.save('k1', false);
  });

  afterEach(() => {
    backend.verify();
    sessionStorage.clear();
  });

  it('sends the stored key to the gateway', () => {
    http.get('http://gw/admin/upstreams').subscribe();
    const req = backend.expectOne('http://gw/admin/upstreams');
    expect(req.request.headers.get('Authorization')).toBe('Bearer k1');
    req.flush([]);
  });

  it('does not send the key anywhere else', () => {
    http.get('http://gw.evil/admin').subscribe();
    const req = backend.expectOne('http://gw.evil/admin');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('leaves an explicit Authorization (a key being tested) alone, even on 401', () => {
    http
      .get('http://gw/admin/upstreams', { headers: { Authorization: 'Bearer new' } })
      .subscribe({ error: () => undefined });
    const req = backend.expectOne('http://gw/admin/upstreams');
    expect(req.request.headers.get('Authorization')).toBe('Bearer new');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(accessKey.hasKey()).toBe(true);
  });

  it('forgets the stored key on 401 and still passes the error on', () => {
    let caught: unknown;
    http.get('http://gw/admin/upstreams').subscribe({ error: (e) => (caught = e) });
    backend
      .expectOne('http://gw/admin/upstreams')
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(accessKey.hasKey()).toBe(false);
    expect(accessKey.notice()).not.toBeNull();
    expect(caught).toBeTruthy();
  });

  it('keeps the key on other errors', () => {
    http.get('http://gw/admin/upstreams').subscribe({ error: () => undefined });
    backend
      .expectOne('http://gw/admin/upstreams')
      .flush(null, { status: 500, statusText: 'Server Error' });

    expect(accessKey.hasKey()).toBe(true);
  });
});
