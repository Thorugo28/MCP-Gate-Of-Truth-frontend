import { computed, DestroyRef, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { errorMessageOf, httpStatusOf } from '../../../shared/core/http/http-error';
import { CallToolResultDto } from '../../../shared/core/api/tool-call.dto';
import { ToolDto } from '../../../shared/core/api/tool.dto';
import { ToolsApi } from '../../../shared/core/api/tools.api';
import { UpstreamStatus } from '../../../shared/core/api/upstream.dto';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';
import { upstreamKeyOf } from '../../../shared/utils/tool-name';
import { argumentsTemplate, parseArguments } from './tool-arguments';

export interface UpstreamOption {
  key: string;
  status: UpstreamStatus;
}

export interface ToolCallResult {
  /** `isError` ausente no fio vale `false`. */
  isError: boolean;
  raw: CallToolResultDto;
}

/**
 * Seleção em dois passos (upstream, depois tool), porque não existe endpoint de todas as tools.
 * `?tool=<nome exposto>` na URL já chega com os dois selecionados.
 */
@Injectable()
export class ToolCallStore {
  private readonly upstreamsApi = inject(UpstreamsApi);
  private readonly toolsApi = inject(ToolsApi);
  private readonly destroyRef = inject(DestroyRef);

  private readonly initialTool = inject(ActivatedRoute).snapshot.queryParamMap.get('tool');

  readonly upstreamKey = signal<string | null>(
    this.initialTool ? upstreamKeyOf(this.initialTool) : null,
  );
  readonly toolName = signal<string | null>(this.initialTool);

  private readonly upstreamsResource = rxResource({ stream: () => this.upstreamsApi.list() });
  private readonly toolsResource = rxResource({
    params: () => this.upstreamKey() ?? undefined,
    stream: ({ params: key }) => this.upstreamsApi.listTools(key),
  });

  readonly upstreams = computed<UpstreamOption[]>(() =>
    this.upstreamsResource.hasValue()
      ? this.upstreamsResource.value().map(({ key, status }) => ({ key, status }))
      : [],
  );
  readonly isLoadingUpstreams = this.upstreamsResource.isLoading;
  readonly upstreamsError = computed(() => errorMessageOf(this.upstreamsResource.error()));

  private readonly allTools = computed<ToolDto[]>(() =>
    this.toolsResource.hasValue() ? this.toolsResource.value() : [],
  );
  /** Só as ligadas: as desligadas estão fora do gateway e a chamada daria 404. */
  readonly tools = computed(() => this.allTools().filter((t) => t.enabled));
  readonly isLoadingTools = this.toolsResource.isLoading;
  /** Erro das tools que não é 404 (este vira `toolNotFound`). */
  readonly toolsError = computed(() =>
    httpStatusOf(this.toolsResource.error()) === 404
      ? null
      : errorMessageOf(this.toolsResource.error()),
  );

  readonly selectedTool = computed(
    () => this.tools().find((t) => t.name === this.toolName()) ?? null,
  );
  /** Upstream selecionado está DOWN: a lista de tools dele vem vazia até reconectar. */
  readonly selectedUpstreamDown = computed(
    () => this.upstreams().find((u) => u.key === this.upstreamKey())?.status === 'DOWN',
  );
  /** Tool pedida (pela URL) que existe mas está desligada: aviso com link para religar, sem chamar. */
  readonly selectedToolDisabled = computed(
    () => this.allTools().find((t) => t.name === this.toolName())?.enabled === false,
  );
  /** Tool pedida (pela URL) que não existe: upstream desconhecido (404) ou nome fora da lista. */
  readonly toolNotFound = computed(() => {
    if (!this.toolName()) {
      return false;
    }
    if (httpStatusOf(this.toolsResource.error()) === 404) {
      return true;
    }
    return (
      this.toolsResource.hasValue() && this.selectedTool() === null && !this.selectedToolDisabled()
    );
  });

  /** Texto do editor; volta para o esqueleto do inputSchema sempre que a tool muda. */
  readonly argumentsText = linkedSignal(() => {
    const tool = this.selectedTool();
    return JSON.stringify(tool ? argumentsTemplate(tool.inputSchema) : {}, null, 2);
  });
  private readonly parsedArguments = computed(() => parseArguments(this.argumentsText()));
  readonly argumentsError = computed(() => {
    const parsed = this.parsedArguments();
    return parsed.ok ? null : parsed.error;
  });

  private readonly calling = signal(false);
  readonly isCalling = this.calling.asReadonly();
  readonly result = signal<ToolCallResult | null>(null);
  readonly callError = signal<string | null>(null);

  readonly canCall = computed(
    () => this.selectedTool() !== null && this.parsedArguments().ok && !this.calling(),
  );

  retryUpstreams(): void {
    this.upstreamsResource.reload();
  }

  retryTools(): void {
    this.toolsResource.reload();
  }

  selectUpstream(key: string): void {
    this.upstreamKey.set(key);
    this.toolName.set(null);
    this.clearResult();
  }

  selectTool(name: string): void {
    this.toolName.set(name);
    this.clearResult();
  }

  call(): void {
    const tool = this.selectedTool();
    const parsed = this.parsedArguments();
    if (!tool || !parsed.ok || this.calling()) {
      return;
    }
    this.clearResult();
    this.calling.set(true);
    this.toolsApi
      .call(tool.name, parsed.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (raw) => {
          this.result.set({ isError: raw.isError ?? false, raw });
          this.calling.set(false);
        },
        error: (error: unknown) => {
          this.callError.set(
            httpStatusOf(error) === 404
              ? `Tool não encontrada, desligada ou com o upstream ${upstreamKeyOf(tool.name)} fora do ar.`
              : `A chamada não chegou à tool. ${errorMessageOf(error)}`,
          );
          this.calling.set(false);
          // A tool estava na lista e a rota sumiu (upstream caiu ou tool desligada): atualiza o seletor.
          if (httpStatusOf(error) === 404) {
            this.upstreamsResource.reload();
            this.toolsResource.reload();
          }
        },
      });
  }

  private clearResult(): void {
    this.result.set(null);
    this.callError.set(null);
  }
}
