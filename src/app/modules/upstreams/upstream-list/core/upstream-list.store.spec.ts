import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ApiError } from '../../../shared/core/http/http-error';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';
import { UpstreamDto } from '../../../shared/core/api/upstream.dto';
import { UPSTREAMS_POLL_INTERVAL_MS } from '../../../shared/core/state/polling';
import {
  DATABASE_DOWN_NOTICE,
  NotificationService,
} from '../../../shared/services/notification.service';
import { UpstreamListStore } from './upstream-list.store';

describe('UpstreamListStore', () => {
  const fromFile = {
    origin: 'file',
    command: null,
    args: null,
    env: null,
    createdAt: null,
    createdBy: null,
    authorization: null,
  } as const;
  const now = Date.parse('2026-10-26T12:00:00Z');
  const upstreams: UpstreamDto[] = [
    {
      key: 'notion',
      serverName: null,
      serverVersion: null,
      status: 'DOWN',
      toolCount: 0,
      attempts: 3,
      nextRetryAt: '2026-10-26T12:00:42Z',
      ...fromFile,
    },
    {
      key: 'filesystem',
      serverName: 'secure-filesystem-server',
      serverVersion: '2.0.1',
      status: 'UP',
      toolCount: 14,
      attempts: null,
      nextRetryAt: null,
      ...fromFile,
    },
  ];
  const docs: UpstreamDto = {
    key: 'docs',
    serverName: null,
    serverVersion: null,
    status: 'DOWN',
    toolCount: 0,
    attempts: 0,
    nextRetryAt: '2026-10-26T12:00:05Z',
    origin: 'panel',
    command: '${NPX_CMD}',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp/docs'],
    env: { PATH: '${NODE_BIN}:/usr/bin' },
    createdAt: '2026-10-26T12:00:00Z',
    createdBy: 'painel',
    authorization: null,
  };
  let list: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let authorize: ReturnType<typeof vi.fn>;
  let notify: ReturnType<typeof vi.fn>;
  let store: UpstreamListStore;

  async function stable(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  beforeEach(async () => {
    // Só o relógio e o setInterval: o whenStable do Angular depende do setTimeout de verdade.
    vi.useFakeTimers({ now, toFake: ['Date', 'setInterval', 'clearInterval'] });
    list = vi.fn(() => of(upstreams));
    create = vi.fn(() => of(docs));
    authorize = vi.fn(() => of({ authorizationUrl: 'https://mcp.notion.com/authorize?state=x' }));
    notify = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        UpstreamListStore,
        {
          provide: UpstreamsApi,
          useValue: { list, create, authorize, allowedCommands: () => of(['/usr/bin/npx']) },
        },
        { provide: NotificationService, useValue: { notify } },
      ],
    });
    store = TestBed.inject(UpstreamListStore);
    await stable();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps DTOs to table rows, with "—" and the retry countdown when DOWN', () => {
    expect(store.rows()).toEqual([
      {
        key: 'notion',
        status: 'DOWN',
        origin: 'file',
        originLabel: 'Arquivo',
        server: '—',
        toolCount: 0,
        retry: 'tentativa 3 · próxima em 42s',
        authorization: null,
      },
      {
        key: 'filesystem',
        status: 'UP',
        origin: 'file',
        originLabel: 'Arquivo',
        server: 'secure-filesystem-server 2.0.1',
        toolCount: 14,
        retry: null,
        authorization: null,
      },
    ]);
  });

  it('counts down every second', () => {
    vi.advanceTimersByTime(2000);
    expect(store.rows()[0].retry).toBe('tentativa 3 · próxima em 40s');
  });

  it('polls the list on an interval and on refresh', async () => {
    expect(list).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(UPSTREAMS_POLL_INTERVAL_MS);
    await stable();
    expect(list).toHaveBeenCalledTimes(2);

    store.refresh();
    await stable();
    expect(list).toHaveBeenCalledTimes(3);
  });

  it('stops polling when destroyed', () => {
    TestBed.resetTestingModule();
    vi.advanceTimersByTime(UPSTREAMS_POLL_INTERVAL_MS * 3);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it('exposes the message when the gateway is down', async () => {
    list.mockReturnValue(throwError(() => new ApiError(0, 'gateway fora do ar')));
    store.refresh();
    await stable();

    expect(store.errorMessage()).toBe('gateway fora do ar');
    expect(store.rows()).toEqual([]);
  });

  it('shows a panel upstream right after the register as "conectando"', async () => {
    list.mockReturnValue(of([docs]));
    store.refresh();
    await stable();

    expect(store.rows()[0]).toMatchObject({
      key: 'docs',
      originLabel: 'Painel',
      retry: 'conectando…',
    });
  });

  it('offers the allowed commands', () => {
    expect(store.allowedCommands()).toEqual(['/usr/bin/npx']);
  });

  it('notifies and reloads after creating', async () => {
    list.mockReturnValue(of([...upstreams, docs]));
    const request = { key: 'docs', command: '${NPX_CMD}', args: [], env: {} };

    store.create(request).subscribe();
    await stable();

    expect(create).toHaveBeenCalledWith(request);
    expect(notify).toHaveBeenCalledWith('docs cadastrado, conectando…');
    expect(store.rows().map((r) => r.key)).toContain('docs');
  });

  it('notifies a database outage on create and still errors for the dialog', () => {
    create.mockReturnValue(throwError(() => new ApiError(503, 'HTTP 503')));
    let failed = false;

    store
      .create({ key: 'docs', command: 'npx', args: [], env: {} })
      .subscribe({ error: () => (failed = true) });

    expect(failed).toBe(true);
    expect(notify).toHaveBeenCalledWith(DATABASE_DOWN_NOTICE);
  });

  it('shows a remote upstream waiting for login without a retry countdown', async () => {
    list.mockReturnValue(
      of([
        {
          ...upstreams[0],
          key: 'notion-remoto',
          attempts: 1,
          nextRetryAt: null,
          authorization: 'NEEDED',
        },
      ]),
    );
    store.refresh();
    await stable();

    expect(store.rows()[0]).toMatchObject({ authorization: 'NEEDED', retry: null });
  });

  it('passes the authorize link through and handles 503 and 404 itself', async () => {
    let url: string | undefined;
    store.authorize('notion-remoto').subscribe((r) => (url = r.authorizationUrl));
    expect(authorize).toHaveBeenCalledWith('notion-remoto');
    expect(url).toContain('mcp.notion.com');

    authorize.mockReturnValue(throwError(() => new ApiError(503, 'HTTP 503')));
    store.authorize('notion-remoto').subscribe({ error: () => undefined });
    expect(notify).toHaveBeenCalledWith(DATABASE_DOWN_NOTICE);
    expect(list).toHaveBeenCalledTimes(1);

    authorize.mockReturnValue(throwError(() => new ApiError(404, 'HTTP 404')));
    store.authorize('notion-remoto').subscribe({ error: () => undefined });
    await stable();
    expect(notify).toHaveBeenCalledWith(
      'O upstream notion-remoto não existe mais; lista recarregada.',
    );
    expect(list).toHaveBeenCalledTimes(2);
  });
});
