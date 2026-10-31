import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-base-url';
import { ToolsApi } from './tools.api';

describe('ToolsApi', () => {
  let api: ToolsApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://gw' },
      ],
    });
    api = TestBed.inject(ToolsApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the arguments object as the body, without envelope', () => {
    api.call('filesystem__read_file', { path: '/tmp/a' }).subscribe();
    const req = http.expectOne('http://gw/admin/tools/filesystem__read_file/call');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ path: '/tmp/a' });
  });

  it('puts the enabled flag and returns the updated tool', () => {
    let name: string | undefined;
    api.setEnabled('notion__API-post-page', false).subscribe((tool) => (name = tool.name));
    const req = http.expectOne('http://gw/admin/tools/notion__API-post-page/enabled');

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ enabled: false });
    req.flush({
      name: 'notion__API-post-page',
      originalName: 'API-post-page',
      description: null,
      inputSchema: {},
      enabled: false,
    });
    expect(name).toBe('notion__API-post-page');
  });

  it('encodes the tool name in the URL', () => {
    api.setEnabled('a__b/c', true).subscribe();
    http.expectOne('http://gw/admin/tools/a__b%2Fc/enabled');
  });
});
