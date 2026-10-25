import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ApiError } from '../../../shared/core/http/http-error';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';
import { UpstreamDto } from '../../../shared/core/api/upstream.dto';
import { UpstreamListStore } from './upstream-list.store';

describe('UpstreamListStore', () => {
  const upstreams: UpstreamDto[] = [
    {
      key: 'notion',
      serverName: 'Notion API',
      serverVersion: '1.0.0',
      status: 'UP',
      toolCount: 24,
    },
    {
      key: 'filesystem',
      serverName: 'secure-filesystem-server',
      serverVersion: '2.0.1',
      status: 'DOWN',
      toolCount: 14,
    },
  ];
  let list: ReturnType<typeof vi.fn>;
  let store: UpstreamListStore;

  beforeEach(async () => {
    list = vi.fn(() => of(upstreams));
    TestBed.configureTestingModule({
      providers: [UpstreamListStore, { provide: UpstreamsApi, useValue: { list } }],
    });
    store = TestBed.inject(UpstreamListStore);
    await TestBed.inject(ApplicationRef).whenStable();
  });

  it('maps DTOs to table rows', () => {
    expect(store.rows()).toEqual([
      { key: 'notion', status: 'UP', server: 'Notion API 1.0.0', toolCount: 24 },
      {
        key: 'filesystem',
        status: 'DOWN',
        server: 'secure-filesystem-server 2.0.1',
        toolCount: 14,
      },
    ]);
  });

  it('fetches again only on refresh', async () => {
    expect(list).toHaveBeenCalledTimes(1);
    store.refresh();
    await TestBed.inject(ApplicationRef).whenStable();
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('exposes the message when the gateway is down', async () => {
    list.mockReturnValue(throwError(() => new ApiError(0, 'gateway fora do ar')));
    store.refresh();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.errorMessage()).toBe('gateway fora do ar');
    expect(store.rows()).toEqual([]);
  });
});
