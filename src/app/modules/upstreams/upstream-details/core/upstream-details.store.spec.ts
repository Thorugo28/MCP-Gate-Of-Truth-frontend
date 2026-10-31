import { HttpErrorResponse } from '@angular/common/http';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ToolDto } from '../../../shared/core/api/tool.dto';
import { ToolsApi } from '../../../shared/core/api/tools.api';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';
import { ApiError } from '../../../shared/core/http/http-error';
import { UpstreamDto } from '../../../shared/core/api/upstream.dto';
import {
  DATABASE_DOWN_NOTICE,
  NotificationService,
} from '../../../shared/services/notification.service';
import { UPSTREAMS_POLL_INTERVAL_MS } from '../../../shared/core/state/polling';
import { byLabel } from '../../../shared/utils/record-labels';
import { UpstreamDetailsStore } from './upstream-details.store';

describe('UpstreamDetailsStore', () => {
  const readFile: ToolDto = {
    name: 'filesystem__read_file',
    originalName: 'read_file',
    description: null,
    inputSchema: { type: 'object' },
    enabled: true,
  };
  const writeFile: ToolDto = {
    name: 'filesystem__write_file',
    originalName: 'write_file',
    description: null,
    inputSchema: { type: 'object' },
    enabled: true,
  };
  const fromFile = {
    origin: 'file',
    command: null,
    args: null,
    env: null,
    createdAt: null,
    createdBy: null,
    authorization: null,
  } as const;
  const docs: UpstreamDto = {
    key: 'docs',
    serverName: 'secure-filesystem-server',
    serverVersion: '2.0.1',
    status: 'UP',
    toolCount: 14,
    attempts: 0,
    nextRetryAt: null,
    origin: 'panel',
    command: '${NPX_CMD}',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp/docs'],
    env: { PATH: '${NODE_BIN}:/usr/bin' },
    createdAt: '2026-10-30T12:00:00Z',
    createdBy: 'painel',
    authorization: null,
  };
  let listTools: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;
  let list: ReturnType<typeof vi.fn>;
  let authorize: ReturnType<typeof vi.fn>;
  let upstreams: UpstreamDto[];
  let setEnabled: ReturnType<typeof vi.fn>;
  let notify: ReturnType<typeof vi.fn>;

  async function stable(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  async function setup(key: string): Promise<UpstreamDetailsStore> {
    TestBed.configureTestingModule({
      providers: [
        UpstreamDetailsStore,
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ key })) } },
        {
          provide: UpstreamsApi,
          useValue: {
            list,
            listTools,
            remove,
            authorize,
          },
        },
        { provide: Router, useValue: { navigate } },
        { provide: ToolsApi, useValue: { setEnabled } },
        { provide: NotificationService, useValue: { notify } },
      ],
    });
    const store = TestBed.inject(UpstreamDetailsStore);
    await stable();
    return store;
  }

  beforeEach(() => {
    upstreams = [
      {
        key: 'filesystem',
        serverName: 'secure-filesystem-server',
        serverVersion: '2.0.1',
        status: 'UP',
        toolCount: 2,
        attempts: null,
        nextRetryAt: null,
        ...fromFile,
      },
      {
        key: 'notion',
        serverName: null,
        serverVersion: null,
        status: 'DOWN',
        toolCount: 0,
        attempts: 1,
        nextRetryAt: '2026-10-26T12:00:15Z',
        ...fromFile,
      },
      docs,
    ];
    list = vi.fn(() => of(upstreams));
    authorize = vi.fn(() => of({ authorizationUrl: 'https://mcp.notion.com/authorize?state=x' }));
    listTools = vi.fn((k: string) =>
      k === 'filesystem' || k === 'docs'
        ? of([readFile, writeFile])
        : k === 'notion'
          ? of([])
          : throwError(() => new HttpErrorResponse({ status: 404 })),
    );
    setEnabled = vi.fn((name: string, enabled: boolean) =>
      of({ ...[readFile, writeFile].find((t) => t.name === name)!, enabled }),
    );
    notify = vi.fn();
    remove = vi.fn(() => of(undefined));
    navigate = vi.fn(() => Promise.resolve(true));
  });

  it('loads the header from the list and the tools of the key', async () => {
    const store = await setup('filesystem');

    expect(store.header()).toEqual({
      key: 'filesystem',
      status: 'UP',
      server: 'secure-filesystem-server 2.0.1',
      tools: '2 tools',
      origin: 'file',
      authorization: null,
    });
    expect(store.definition()).toBeNull();
    expect(store.canRemove()).toBe(false);
    expect(store.tools().map((t) => t.name)).toEqual([readFile.name, writeFile.name]);
    expect(store.tools()[0]).toEqual({ ...readFile, checked: true, toggling: false });
    expect(store.notFound()).toBe(false);
    expect(store.isDown()).toBe(false);
  });

  it('counts the disabled tools in the header', async () => {
    listTools.mockReturnValue(of([readFile, { ...writeFile, enabled: false }]));
    const store = await setup('filesystem');

    expect(store.header()?.tools).toBe('2 tools, 1 desligada');
  });

  it('flags a DOWN upstream without a server name', async () => {
    const store = await setup('notion');

    expect(store.header()?.server).toBe('—');
    expect(store.isDown()).toBe(true);
    expect(store.tools()).toEqual([]);
  });

  it('flags an unknown key as not found', async () => {
    const store = await setup('xpto');

    expect(store.notFound()).toBe(true);
    expect(store.header()).toBeNull();
    expect(store.tools()).toEqual([]);
  });

  it('disables the toggle while the request is in flight and swaps the row on success', async () => {
    const response = new Subject<ToolDto>();
    setEnabled.mockReturnValue(response);
    const store = await setup('filesystem');

    store.setEnabled(writeFile, false);
    expect(setEnabled).toHaveBeenCalledWith('filesystem__write_file', false);
    expect(store.tools()[1]).toMatchObject({ enabled: true, checked: false, toggling: true });

    response.next({ ...writeFile, enabled: false });
    expect(store.tools()[1]).toMatchObject({ enabled: false, checked: false, toggling: false });
    expect(store.header()?.tools).toBe('2 tools, 1 desligada');
    expect(notify).toHaveBeenCalledWith('write_file desligada');
  });

  it('says "religada" when turning a tool back on', async () => {
    listTools.mockReturnValue(of([readFile, { ...writeFile, enabled: false }]));
    const store = await setup('filesystem');

    store.setEnabled(store.tools()[1], true);
    expect(store.tools()[1]).toMatchObject({ enabled: true, checked: true });
    expect(notify).toHaveBeenCalledWith('write_file religada');
  });

  it('puts the toggle back on 503 and explains that nothing changed', async () => {
    setEnabled.mockReturnValue(throwError(() => new ApiError(503, 'HTTP 503')));
    const store = await setup('filesystem');

    store.setEnabled(writeFile, false);

    expect(store.tools()[1]).toMatchObject({ enabled: true, checked: true, toggling: false });
    expect(notify).toHaveBeenCalledWith('Banco do gateway fora do ar; nada mudou.');
    expect(store.toolsError()).toBeNull();
  });

  it('puts the toggle back on 404 and reloads the tools', async () => {
    setEnabled.mockReturnValue(throwError(() => new ApiError(404, 'HTTP 404')));
    const store = await setup('filesystem');
    listTools.mockReturnValue(of([readFile]));

    store.setEnabled(writeFile, false);
    expect(store.tools()[1]).toMatchObject({ checked: true, toggling: false });
    await stable();

    expect(notify).toHaveBeenCalledWith('write_file saiu do upstream; lista recarregada.');
    expect(store.tools().map((t) => t.name)).toEqual([readFile.name]);
    expect(store.notFound()).toBe(false);
  });

  it('shows the definition of a panel upstream as registered', async () => {
    const store = await setup('docs');

    expect(store.definition()).toEqual({
      command: '${NPX_CMD}',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp/docs'],
      env: [{ name: 'PATH', value: '${NODE_BIN}:/usr/bin' }],
      created: byLabel(docs.createdAt!, 'painel'),
    });
    expect(store.canRemove()).toBe(true);
  });

  it('removes, notifies and goes back to the list', async () => {
    const store = await setup('docs');

    store.remove();

    expect(remove).toHaveBeenCalledWith('docs');
    expect(notify).toHaveBeenCalledWith('Upstream docs removido.');
    expect(navigate).toHaveBeenCalledWith(['/', 'upstreams']);
    expect(store.removing()).toBe(false);
  });

  it('goes back to the list on 404 and stays on 503', async () => {
    const store = await setup('docs');

    remove.mockReturnValue(throwError(() => new ApiError(503, 'HTTP 503')));
    store.remove();
    expect(notify).toHaveBeenCalledWith(DATABASE_DOWN_NOTICE);
    expect(navigate).not.toHaveBeenCalled();

    remove.mockReturnValue(throwError(() => new ApiError(404, 'HTTP 404')));
    store.remove();
    expect(notify).toHaveBeenCalledWith('O upstream docs já não existia.');
    expect(navigate).toHaveBeenCalledWith(['/', 'upstreams']);
  });

  describe('OAuth', () => {
    const remote: UpstreamDto = {
      key: 'notion-remoto',
      serverName: null,
      serverVersion: null,
      status: 'DOWN',
      toolCount: 0,
      attempts: 1,
      nextRetryAt: null,
      ...fromFile,
      authorization: 'NEEDED',
    };

    beforeEach(() => {
      upstreams = [remote];
      listTools.mockReturnValue(of([]));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('exposes the authorization state of the header', async () => {
      const store = await setup('notion-remoto');
      expect(store.authorization()).toBe('NEEDED');
    });

    it('passes the link through and handles 503 and 404 itself', async () => {
      const store = await setup('notion-remoto');
      let url: string | undefined;
      store.authorize().subscribe((r) => (url = r.authorizationUrl));
      expect(authorize).toHaveBeenCalledWith('notion-remoto');
      expect(url).toContain('mcp.notion.com');

      authorize.mockReturnValue(throwError(() => new ApiError(503, 'HTTP 503')));
      store.authorize().subscribe({ error: () => undefined });
      expect(notify).toHaveBeenCalledWith(DATABASE_DOWN_NOTICE);
      expect(navigate).not.toHaveBeenCalled();

      authorize.mockReturnValue(throwError(() => new ApiError(404, 'HTTP 404')));
      store.authorize().subscribe({ error: () => undefined });
      expect(navigate).toHaveBeenCalledWith(['/', 'upstreams']);
    });

    it('polls while waiting and loads the tools once it comes UP', async () => {
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
      const store = await setup('notion-remoto');
      expect(list).toHaveBeenCalledTimes(1);
      expect(listTools).toHaveBeenCalledTimes(1);

      upstreams = [
        { ...remote, status: 'UP', serverName: 'Notion', authorization: 'OK', nextRetryAt: null },
      ];
      listTools.mockReturnValue(of([readFile]));
      vi.advanceTimersByTime(UPSTREAMS_POLL_INTERVAL_MS);
      await stable();

      expect(list).toHaveBeenCalledTimes(2);
      expect(store.authorization()).toBe('OK');
      expect(listTools).toHaveBeenCalledTimes(2);
      expect(store.tools().map((t) => t.name)).toEqual([readFile.name]);

      // UP: para de consultar
      vi.advanceTimersByTime(UPSTREAMS_POLL_INTERVAL_MS * 2);
      await stable();
      expect(list).toHaveBeenCalledTimes(2);
    });
  });
});
