import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CallDto } from '../../../shared/core/api/call.dto';
import { CallsApi } from '../../../shared/core/api/calls.api';
import { ApiError } from '../../../shared/core/http/http-error';
import { CALLS_POLL_INTERVAL_MS } from '../../../shared/core/state/polling';
import { timeLabel } from './call-labels';
import { CALLS_LIMIT, CallListStore, DATABASE_DOWN_MESSAGE } from './call-list.store';

describe('CallListStore', () => {
  const calls: CallDto[] = [
    {
      at: '2026-10-26T22:15:03Z',
      caller: 'cli',
      via: 'mcp',
      tool: 'notion__API-get-self',
      upstream: 'notion',
      durationMs: 5001,
      outcome: 'TIMEOUT',
      error: "Upstream 'notion' não respondeu em 5s",
    },
    {
      at: '2026-10-26T22:14:00Z',
      caller: 'painel',
      via: 'admin',
      tool: 'filesystem__list_allowed_directories',
      upstream: 'filesystem',
      durationMs: 12,
      outcome: 'OK',
      error: null,
    },
  ];
  let list: ReturnType<typeof vi.fn>;
  let store: CallListStore;

  async function stable(): Promise<void> {
    await TestBed.inject(ApplicationRef).whenStable();
  }

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    list = vi.fn(() => of(calls));
    TestBed.configureTestingModule({
      providers: [CallListStore, { provide: CallsApi, useValue: { list } }],
    });
    store = TestBed.inject(CallListStore);
    await stable();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('asks for the latest calls without filters and maps them to rows', () => {
    expect(list).toHaveBeenCalledWith({ limit: CALLS_LIMIT, caller: '', tool: '', outcome: null });
    expect(store.rows()).toEqual([
      {
        at: '2026-10-26T22:15:03Z',
        time: timeLabel('2026-10-26T22:15:03Z'),
        caller: 'cli',
        via: 'mcp',
        viaLabel: 'MCP',
        tool: 'notion__API-get-self',
        duration: '5,0 s',
        outcome: 'TIMEOUT',
        error: "Upstream 'notion' não respondeu em 5s",
      },
      {
        at: '2026-10-26T22:14:00Z',
        time: timeLabel('2026-10-26T22:14:00Z'),
        caller: 'painel',
        via: 'admin',
        viaLabel: 'Playground',
        tool: 'filesystem__list_allowed_directories',
        duration: '12 ms',
        outcome: 'OK',
        error: null,
      },
    ]);
    expect(store.isFiltered()).toBe(false);
  });

  it('reloads with the filter, keeping the other fields and trimming text', async () => {
    store.updateFilter({ caller: ' cli ' });
    store.updateFilter({ outcome: 'TOOL_ERROR' });
    await stable();

    expect(list).toHaveBeenLastCalledWith({
      limit: CALLS_LIMIT,
      caller: 'cli',
      tool: '',
      outcome: 'TOOL_ERROR',
    });
    expect(store.isFiltered()).toBe(true);

    store.updateFilter({ outcome: null });
    expect(store.filter()).toEqual({ caller: 'cli', tool: '', outcome: null });

    store.clearFilter();
    expect(store.isFiltered()).toBe(false);
  });

  it('polls on an interval and on refresh', async () => {
    expect(list).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(CALLS_POLL_INTERVAL_MS);
    await stable();
    expect(list).toHaveBeenCalledTimes(2);

    store.refresh();
    await stable();
    expect(list).toHaveBeenCalledTimes(3);
  });

  it('stops polling when destroyed', () => {
    TestBed.resetTestingModule();
    vi.advanceTimersByTime(CALLS_POLL_INTERVAL_MS * 3);
    expect(list).toHaveBeenCalledTimes(1);
  });

  it('is empty when the gateway has no calls yet', async () => {
    list.mockReturnValue(of([]));
    store.refresh();
    await stable();
    expect(store.isEmpty()).toBe(true);
  });

  it('exposes the message when the gateway is down', async () => {
    list.mockReturnValue(throwError(() => new ApiError(0, 'gateway fora do ar')));
    store.refresh();
    await stable();

    expect(store.errorMessage()).toBe('gateway fora do ar');
    expect(store.rows()).toEqual([]);
  });

  it('explains a 503 as the database being down and recovers on the next poll', async () => {
    list.mockReturnValue(throwError(() => new ApiError(503, 'HTTP 503')));
    store.refresh();
    await stable();
    expect(store.errorMessage()).toBe(DATABASE_DOWN_MESSAGE);

    list.mockReturnValue(of(calls));
    vi.advanceTimersByTime(CALLS_POLL_INTERVAL_MS);
    await stable();
    expect(store.errorMessage()).toBeNull();
    expect(store.rows()).toHaveLength(2);
  });
});
