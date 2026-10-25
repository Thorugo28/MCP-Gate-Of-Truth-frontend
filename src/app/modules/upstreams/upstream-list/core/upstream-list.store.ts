import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { errorMessageOf } from '../../../shared/core/http/http-error';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';
import { UpstreamDto, UpstreamStatus } from '../../../shared/core/api/upstream.dto';

export interface UpstreamRow {
  key: string;
  status: UpstreamStatus;
  /** `"<nome> <versão>"` anunciado pelo servidor. */
  server: string;
  toolCount: number;
}

function toRow(dto: UpstreamDto): UpstreamRow {
  return {
    key: dto.key,
    status: dto.status,
    server: `${dto.serverName} ${dto.serverVersion}`,
    toolCount: dto.toolCount,
  };
}

/**
 * Fornecido nas rotas da feature: sobrevive à navegação, então a lista (lenta, o backend faz ping
 * em cada upstream) só é buscada de novo pelo `refresh()`.
 */
@Injectable()
export class UpstreamListStore {
  private readonly api = inject(UpstreamsApi);

  private readonly resource = rxResource({ stream: () => this.api.list() });

  readonly rows = computed(() =>
    (this.resource.hasValue() ? this.resource.value() : []).map(toRow),
  );
  readonly isLoading = this.resource.isLoading;
  readonly errorMessage = computed(() => errorMessageOf(this.resource.error()));
  readonly isEmpty = computed(() => this.resource.hasValue() && this.resource.value().length === 0);

  refresh(): void {
    this.resource.reload();
  }
}
