import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../shared/core/api/api-base-url';
import { KeyDto } from '../../../shared/core/api/key.dto';
import { KeysApi } from '../../../shared/core/api/keys.api';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';
import { ApiError } from '../../../shared/core/http/http-error';
import {
  DATABASE_DOWN_NOTICE,
  NotificationService,
} from '../../../shared/services/notification.service';
import { dateLabel } from '../../../shared/utils/record-labels';
import { KeyListStore } from './key-list.store';

describe('KeyListStore', () => {
  const cli: KeyDto = {
    name: 'cli',
    upstreams: ['*'],
    admin: false,
    origin: 'file',
    createdAt: null,
    createdBy: null,
    revokedAt: null,
    revokedBy: null,
  };
  const teste: KeyDto = {
    name: 'teste',
    upstreams: ['filesystem'],
    admin: false,
    origin: 'panel',
    createdAt: '2026-10-28T12:00:00Z',
    createdBy: 'painel',
    revokedAt: null,
    revokedBy: null,
  };
  const antiga: KeyDto = {
    ...teste,
    name: 'antiga',
    upstreams: [],
    admin: true,
    revokedAt: '2026-10-29T12:00:00Z',
    revokedBy: 'painel',
  };
  let list: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let revoke: ReturnType<typeof vi.fn>;
  let notify: ReturnType<typeof vi.fn>;
  let store: KeyListStore;

  async function stable(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  beforeEach(async () => {
    list = vi.fn(() => of([antiga, cli, teste]));
    create = vi.fn();
    revoke = vi.fn(() => of(undefined));
    notify = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        KeyListStore,
        { provide: API_BASE_URL, useValue: 'http://gw' },
        { provide: KeysApi, useValue: { list, create, revoke } },
        {
          provide: UpstreamsApi,
          useValue: { list: () => of([{ key: 'filesystem' }, { key: 'notion' }]) },
        },
        { provide: NotificationService, useValue: { notify } },
      ],
    });
    store = TestBed.inject(KeyListStore);
    await stable();
  });

  it('hides the revoked keys by default', () => {
    expect(store.rows().map((r) => r.name)).toEqual(['cli', 'teste']);
    expect(store.revokedCount()).toBe(1);

    store.showRevoked.set(true);
    expect(store.rows().map((r) => r.name)).toEqual(['antiga', 'cli', 'teste']);
  });

  it('maps the rows for the table', () => {
    store.showRevoked.set(true);
    const [revoked, file, panel] = store.rows();

    expect(file).toMatchObject({
      originLabel: 'Arquivo',
      upstreams: ['todos'],
      created: null,
      status: 'Ativa',
      canRevoke: false,
    });
    expect(panel).toMatchObject({
      originLabel: 'Painel',
      upstreams: ['filesystem'],
      created: `${dateLabel(teste.createdAt!)} por painel`,
      canRevoke: true,
    });
    expect(revoked).toMatchObject({
      upstreams: ['nenhum'],
      admin: true,
      status: `Revogada em ${dateLabel(antiga.revokedAt!)} por painel`,
      revoked: true,
      canRevoke: false,
    });
  });

  it('offers the upstream keys for a new key and builds the /mcp URL', () => {
    expect(store.upstreamKeys()).toEqual(['filesystem', 'notion']);
    expect(store.mcpUrl).toBe('http://gw/mcp');
  });

  it('reloads after creating and keeps the value out of its state', async () => {
    create.mockReturnValue(of({ key: { ...teste, name: 'nova' }, value: 'segredo123' }));
    list.mockReturnValue(of([cli, teste, { ...teste, name: 'nova' }]));
    let value: string | undefined;

    store
      .create({ name: 'nova', upstreams: ['*'], admin: false })
      .subscribe((c) => (value = c.value));
    await stable();

    expect(value).toBe('segredo123');
    expect(store.rows().map((r) => r.name)).toContain('nova');
    expect(JSON.stringify([store.rows(), store.upstreamKeys(), store.revoking()])).not.toContain(
      'segredo123',
    );
  });

  it('notifies a database outage on create and still errors for the dialog', () => {
    create.mockReturnValue(throwError(() => new ApiError(503, 'HTTP 503')));
    let failed = false;

    store
      .create({ name: 'nova', upstreams: [], admin: false })
      .subscribe({ error: () => (failed = true) });

    expect(failed).toBe(true);
    expect(notify).toHaveBeenCalledWith(DATABASE_DOWN_NOTICE);
  });

  it('revokes, notifies and reloads', async () => {
    list.mockReturnValue(
      of([cli, { ...teste, revokedAt: '2026-10-29T13:00:00Z', revokedBy: 'painel' }]),
    );

    store.revoke('teste');
    await stable();

    expect(revoke).toHaveBeenCalledWith('teste');
    expect(notify).toHaveBeenCalledWith('Chave teste revogada.');
    expect(store.rows().map((r) => r.name)).toEqual(['cli']);
    expect(store.revoking()).toBeNull();
  });

  it('reloads on 404 and only notifies on 503', async () => {
    revoke.mockReturnValue(throwError(() => new ApiError(503, 'HTTP 503')));
    store.revoke('teste');
    expect(notify).toHaveBeenCalledWith(DATABASE_DOWN_NOTICE);
    expect(list).toHaveBeenCalledTimes(1);

    revoke.mockReturnValue(throwError(() => new ApiError(404, 'HTTP 404')));
    store.revoke('teste');
    await stable();
    expect(notify).toHaveBeenCalledWith('A chave teste não existe mais; lista recarregada.');
    expect(list).toHaveBeenCalledTimes(2);
  });
});
