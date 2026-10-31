import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-base-url';
import { KeysApi } from './keys.api';

describe('KeysApi', () => {
  let api: KeysApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://gw' },
      ],
    });
    api = TestBed.inject(KeysApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists the keys', () => {
    api.list().subscribe();
    const req = http.expectOne('http://gw/admin/keys');

    expect(req.request.method).toBe('GET');
  });

  it('posts the new key request as the body', () => {
    let value: string | undefined;
    api
      .create({ name: 'teste', upstreams: ['filesystem'], admin: false })
      .subscribe((created) => (value = created.value));
    const req = http.expectOne('http://gw/admin/keys');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'teste', upstreams: ['filesystem'], admin: false });
    req.flush({ key: { name: 'teste' }, value: 'abc123' }, { status: 201, statusText: 'Created' });
    expect(value).toBe('abc123');
  });

  it('deletes the key with the name encoded in the URL', () => {
    api.revoke('a/b').subscribe();
    const req = http.expectOne('http://gw/admin/keys/a%2Fb');

    expect(req.request.method).toBe('DELETE');
  });
});
