import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-base-url';
import { UpstreamsApi } from './upstreams.api';

describe('UpstreamsApi', () => {
  let api: UpstreamsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://gw' },
      ],
    });
    api = TestBed.inject(UpstreamsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists upstreams', () => {
    api.list().subscribe();
    expect(http.expectOne('http://gw/admin/upstreams').request.method).toBe('GET');
  });

  it('lists the tools of an upstream', () => {
    api.listTools('filesystem').subscribe();
    expect(http.expectOne('http://gw/admin/upstreams/filesystem/tools').request.method).toBe('GET');
  });
});
