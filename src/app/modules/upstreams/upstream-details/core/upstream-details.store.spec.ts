import { HttpErrorResponse } from '@angular/common/http';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToolDto } from '../../../shared/core/api/tool.dto';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';
import { UpstreamDetailsStore } from './upstream-details.store';

describe('UpstreamDetailsStore', () => {
  const tool: ToolDto = {
    name: 'filesystem__read_file',
    originalName: 'read_file',
    description: null,
    inputSchema: { type: 'object' },
  };

  async function setup(key: string): Promise<UpstreamDetailsStore> {
    TestBed.configureTestingModule({
      providers: [
        UpstreamDetailsStore,
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ key })) } },
        {
          provide: UpstreamsApi,
          useValue: {
            list: () =>
              of([
                {
                  key: 'filesystem',
                  serverName: 'secure-filesystem-server',
                  serverVersion: '2.0.1',
                  status: 'UP',
                  toolCount: 14,
                },
              ]),
            listTools: (k: string) =>
              k === 'filesystem'
                ? of([tool])
                : throwError(() => new HttpErrorResponse({ status: 404 })),
          },
        },
      ],
    });
    const store = TestBed.inject(UpstreamDetailsStore);
    await TestBed.inject(ApplicationRef).whenStable();
    return store;
  }

  it('loads the header from the list and the tools of the key', async () => {
    const store = await setup('filesystem');

    expect(store.header()).toEqual({
      key: 'filesystem',
      status: 'UP',
      server: 'secure-filesystem-server 2.0.1',
      toolCount: 14,
    });
    expect(store.tools()).toEqual([tool]);
    expect(store.notFound()).toBe(false);
  });

  it('flags an unknown key as not found', async () => {
    const store = await setup('xpto');

    expect(store.notFound()).toBe(true);
    expect(store.header()).toBeNull();
    expect(store.tools()).toEqual([]);
  });
});
