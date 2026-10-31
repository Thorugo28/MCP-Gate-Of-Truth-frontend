import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-base-url';
import { CallsApi } from './calls.api';

describe('CallsApi', () => {
  let api: CallsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://gw' },
      ],
    });
    api = TestBed.inject(CallsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists calls without params by default', () => {
    api.list().subscribe();
    expect(http.expectOne('http://gw/admin/calls').request.method).toBe('GET');
  });

  it('sends only the filters that have a value', () => {
    api.list({ limit: 100, caller: 'cli', tool: '', outcome: null }).subscribe();
    http.expectOne('http://gw/admin/calls?limit=100&caller=cli');
  });

  it('sends the outcome filter', () => {
    api.list({ tool: 'filesystem__read_file', outcome: 'TOOL_ERROR' }).subscribe();
    http.expectOne('http://gw/admin/calls?tool=filesystem__read_file&outcome=TOOL_ERROR');
  });
});
