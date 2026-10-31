import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CallDto, CallOutcome, CallVia } from '../../../shared/core/api/call.dto';
import { CallsApi } from '../../../shared/core/api/calls.api';
import { errorMessageOf, httpStatusOf } from '../../../shared/core/http/http-error';
import { CALLS_POLL_INTERVAL_MS, pollWhileVisible } from '../../../shared/core/state/polling';
import { durationLabel, timeLabel, viaLabel } from './call-labels';

/** Quantas chamadas pedir; o backend devolve no máximo 500. */
export const CALLS_LIMIT = 100;

/** Igualdade exata, como no backend; vazio/`null` não filtra. */
export interface CallFilter {
  caller: string;
  tool: string;
  outcome: CallOutcome | null;
}

export const NO_FILTER: CallFilter = { caller: '', tool: '', outcome: null };

export const DATABASE_DOWN_MESSAGE =
  'O banco do gateway está fora do ar; as tools continuam funcionando, só o histórico não aparece.';

export interface CallRow {
  /** ISO original, para o `<time datetime>`. */
  at: string;
  time: string;
  caller: string;
  via: CallVia;
  viaLabel: string;
  tool: string;
  duration: string;
  outcome: CallOutcome;
  error: string | null;
}

function toRow(dto: CallDto): CallRow {
  return {
    at: dto.at,
    time: timeLabel(dto.at),
    caller: dto.caller,
    via: dto.via,
    viaLabel: viaLabel(dto.via),
    tool: dto.tool,
    duration: durationLabel(dto.durationMs),
    outcome: dto.outcome,
    error: dto.error,
  };
}

/**
 * Fornecido na página: morre com a tela, e o polling junto. A lista vem do banco do gateway, já filtrada por lá.
 * Banco fora do ar (503): estado de erro próprio; o polling segue e a tabela volta sozinha.
 */
@Injectable()
export class CallListStore {
  private readonly api = inject(CallsApi);

  readonly filter = signal<CallFilter>(NO_FILTER);

  private readonly resource = rxResource({
    params: () => this.filter(),
    stream: ({ params }) => this.api.list({ limit: CALLS_LIMIT, ...params }),
  });

  readonly rows = computed(() =>
    (this.resource.hasValue() ? this.resource.value() : []).map(toRow),
  );
  readonly isLoading = this.resource.isLoading;
  /** Primeira carga, troca de filtro ou depois de erro: os recarregamentos do polling não piscam o loading. */
  readonly isFirstLoad = computed(() => this.resource.isLoading() && !this.resource.hasValue());
  readonly errorMessage = computed(() =>
    httpStatusOf(this.resource.error()) === 503
      ? DATABASE_DOWN_MESSAGE
      : errorMessageOf(this.resource.error()),
  );
  readonly isEmpty = computed(() => this.resource.hasValue() && this.resource.value().length === 0);
  readonly isFiltered = computed(() => {
    const f = this.filter();
    return f.caller !== '' || f.tool !== '' || f.outcome !== null;
  });

  constructor() {
    pollWhileVisible(() => this.resource.reload(), this.isLoading, CALLS_POLL_INTERVAL_MS);
  }

  /** Muda só os campos passados; texto vai sem espaços nas pontas. */
  updateFilter(change: Partial<CallFilter>): void {
    this.filter.update((f) => ({
      caller: (change.caller ?? f.caller).trim(),
      tool: (change.tool ?? f.tool).trim(),
      outcome: change.outcome !== undefined ? change.outcome : f.outcome,
    }));
  }

  clearFilter(): void {
    this.filter.set(NO_FILTER);
  }

  refresh(): void {
    this.resource.reload();
  }
}
