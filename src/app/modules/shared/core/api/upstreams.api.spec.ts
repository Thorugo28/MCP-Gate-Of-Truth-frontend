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

  it('lists the allowed commands', () => {
    let commands: string[] | undefined;
    api.allowedCommands().subscribe((c) => (commands = c));
    const req = http.expectOne('http://gw/admin/upstreams/allowed-commands');

    expect(req.request.method).toBe('GET');
    req.flush(['/usr/bin/npx']);
    expect(commands).toEqual(['/usr/bin/npx']);
  });

  it('posts the new upstream as the body', () => {
    const body = {
      key: 'docs',
      command: '${NPX_CMD}',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/home/x'],
      env: { PATH: '${NODE_BIN}:/usr/bin' },
    };
    api.create(body).subscribe();
    const req = http.expectOne('http://gw/admin/upstreams');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
  });

  it('deletes the upstream with the key encoded in the URL', () => {
    api.remove('a/b').subscribe();
    const req = http.expectOne('http://gw/admin/upstreams/a%2Fb');

    expect(req.request.method).toBe('DELETE');
  });

  it('posts the authorize request with the key encoded in the URL', () => {
    let url: string | undefined;
    api.authorize('notion remoto').subscribe((r) => (url = r.authorizationUrl));
    const req = http.expectOne('http://gw/admin/upstreams/notion%20remoto/authorize');

    expect(req.request.method).toBe('POST');
    req.flush({ authorizationUrl: 'https://mcp.notion.com/authorize?state=x' });
    expect(url).toBe('https://mcp.notion.com/authorize?state=x');
  });
});
