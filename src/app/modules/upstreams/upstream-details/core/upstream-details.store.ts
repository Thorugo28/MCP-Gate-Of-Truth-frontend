import { computed, inject, Injectable } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { errorMessageOf, httpStatusOf } from '../../../shared/core/http/http-error';
import { ToolDto } from '../../../shared/core/api/tool.dto';
import { UpstreamStatus } from '../../../shared/core/api/upstream.dto';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';

export interface UpstreamHeader {
  key: string;
  status: UpstreamStatus;
  /** `"<nome> <versão>"` anunciado pelo servidor. */
  server: string;
  toolCount: number;
}

/**
 * Não existe endpoint de um upstream só: o cabeçalho vem do item de `GET /admin/upstreams` (lento, faz ping)
 * e as tools de `/admin/upstreams/{key}/tools` (rápido, e é quem diz se a chave existe).
 */
@Injectable()
export class UpstreamDetailsStore {
  private readonly api = inject(UpstreamsApi);

  readonly key = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('key') ?? '')), {
    requireSync: true,
  });

  private readonly upstreamsResource = rxResource({ stream: () => this.api.list() });
  private readonly toolsResource = rxResource({
    params: () => this.key(),
    stream: ({ params: key }) => this.api.listTools(key),
  });

  readonly header = computed<UpstreamHeader | null>(() => {
    if (!this.upstreamsResource.hasValue()) {
      return null;
    }
    const dto = this.upstreamsResource.value().find((u) => u.key === this.key());
    return dto
      ? {
          key: dto.key,
          status: dto.status,
          server: `${dto.serverName} ${dto.serverVersion}`,
          toolCount: dto.toolCount,
        }
      : null;
  });
  readonly isLoadingHeader = this.upstreamsResource.isLoading;
  readonly headerError = computed(() => errorMessageOf(this.upstreamsResource.error()));

  readonly tools = computed<ToolDto[]>(() =>
    this.toolsResource.hasValue() ? this.toolsResource.value() : [],
  );
  readonly isLoadingTools = this.toolsResource.isLoading;
  readonly notFound = computed(() => httpStatusOf(this.toolsResource.error()) === 404);
  /** Erro das tools que não é 404 (este vira `notFound`). */
  readonly toolsError = computed(() =>
    this.notFound() ? null : errorMessageOf(this.toolsResource.error()),
  );
  readonly hasNoTools = computed(
    () => this.toolsResource.hasValue() && this.toolsResource.value().length === 0,
  );

  retryHeader(): void {
    this.upstreamsResource.reload();
  }

  retryTools(): void {
    this.toolsResource.reload();
  }
}
