import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-base-url';
import { ToolsApi } from './tools.api';

describe('ToolsApi', () => {
  it('posts the arguments object as the body, without envelope', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://gw' },
      ],
    });
    const http = TestBed.inject(HttpTestingController);

    TestBed.inject(ToolsApi).call('filesystem__read_file', { path: '/tmp/a' }).subscribe();
    const req = http.expectOne('http://gw/admin/tools/filesystem__read_file/call');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ path: '/tmp/a' });
    http.verify();
  });
});
