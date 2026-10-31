import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { rxResource, takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, Observable, throwError } from 'rxjs';
import { errorMessageOf, httpStatusOf } from '../../../shared/core/http/http-error';
import { ToolDto } from '../../../shared/core/api/tool.dto';
import { ToolsApi } from '../../../shared/core/api/tools.api';
import {
  AuthorizeResponse,
  UpstreamAuthorization,
  UpstreamOrigin,
  UpstreamStatus,
} from '../../../shared/core/api/upstream.dto';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';
import { AppPaths } from '../../../shared/core/routes/app-paths';
import { pollWhileVisible, UPSTREAMS_POLL_INTERVAL_MS } from '../../../shared/core/state/polling';
import {
  DATABASE_DOWN_NOTICE,
  NotificationService,
} from '../../../shared/services/notification.service';
import { byLabel } from '../../../shared/utils/record-labels';
import { serverLabel } from '../../../shared/utils/upstream-labels';

export interface UpstreamHeader {
  key: string;
  status: UpstreamStatus;
  /** `"<nome> <versão>"` anunciado pelo servidor, ou `"—"` quando DOWN. */
  server: string;
  /** `"14 tools, 1 desligada"`, contado da lista de tools (o `toolCount` do upstream só conta as ligadas). */
  tools: string;
  origin: UpstreamOrigin;
  /** `NEEDED`: espera login; `OK`: autorizado; `null` = sem OAuth (nada aparece). */
  authorization: UpstreamAuthorization | null;
}

/** Como o upstream do painel foi cadastrado: referências `${VAR}` cruas, nunca o valor resolvido. */
export interface UpstreamDefinition {
  command: string;
  args: string[];
  env: { name: string; value: string }[];
  /** `"26/10 por painel"`. */
  created: string | null;
}

export interface ToolRow extends ToolDto {
  /** Estado mostrado no toggle: o pedido em voo, ou o `enabled` do gateway. */
  checked: boolean;
  /** Requisição de ligar/desligar em voo: o toggle fica desabilitado. */
  toggling: boolean;
}

function toolsLabel(tools: ToolDto[]): string {
  const disabled = tools.filter((t) => !t.enabled).length;
  const total = `${tools.length} ${tools.length === 1 ? 'tool' : 'tools'}`;
  return disabled === 0
    ? total
    : `${total}, ${disabled} ${disabled === 1 ? 'desligada' : 'desligadas'}`;
}

/**
 * Não existe endpoint de um upstream só: o cabeçalho vem do item de `GET /admin/upstreams`
 * e as tools de `/admin/upstreams/{key}/tools` (é quem diz se a chave existe; upstream DOWN devolve `[]`).
 * Ligar/desligar não é otimista: a linha só muda com o `ToolDto` que o gateway devolve.
 */
@Injectable()
export class UpstreamDetailsStore {
  private readonly api = inject(UpstreamsApi);
  private readonly toolsApi = inject(ToolsApi);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly key = toSignal(inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('key') ?? '')), {
    requireSync: true,
  });

  private readonly upstreamsResource = rxResource({ stream: () => this.api.list() });
  private readonly toolsResource = rxResource({
    params: () => this.key(),
    stream: ({ params: key }) => this.api.listTools(key),
  });

  /** Nome da tool → estado pedido, enquanto o PUT está em voo. */
  private readonly pending = signal<ReadonlyMap<string, boolean>>(new Map());

  private readonly upstream = computed(() =>
    this.upstreamsResource.hasValue()
      ? (this.upstreamsResource.value().find((u) => u.key === this.key()) ?? null)
      : null,
  );

  readonly header = computed<UpstreamHeader | null>(() => {
    const dto = this.upstream();
    return dto
      ? {
          key: dto.key,
          status: dto.status,
          server: serverLabel(dto),
          tools: this.toolsResource.hasValue()
            ? toolsLabel(this.toolsResource.value())
            : `${dto.toolCount} tools ligadas`,
          origin: dto.origin,
          authorization: dto.authorization,
        }
      : null;
  });
  /** Só nos do painel; os do yml mostram só a origem (os valores resolvidos podem ter segredo). */
  readonly definition = computed<UpstreamDefinition | null>(() => {
    const dto = this.upstream();
    if (dto?.origin !== 'panel' || dto.command === null) {
      return null;
    }
    return {
      command: dto.command,
      args: dto.args ?? [],
      env: Object.entries(dto.env ?? {}).map(([name, value]) => ({ name, value })),
      created: dto.createdAt ? byLabel(dto.createdAt, dto.createdBy) : null,
    };
  });
  readonly canRemove = computed(() => this.upstream()?.origin === 'panel');
  /** DELETE em voo. */
  readonly removing = signal(false);
  readonly isLoadingHeader = this.upstreamsResource.isLoading;
  readonly headerError = computed(() => errorMessageOf(this.upstreamsResource.error()));

  readonly tools = computed<ToolRow[]>(() => {
    const pending = this.pending();
    return (this.toolsResource.hasValue() ? this.toolsResource.value() : []).map((tool) => ({
      ...tool,
      checked: pending.get(tool.name) ?? tool.enabled,
      toggling: pending.has(tool.name),
    }));
  });
  readonly isLoadingTools = this.toolsResource.isLoading;
  readonly notFound = computed(() => httpStatusOf(this.toolsResource.error()) === 404);
  /** Erro das tools que não é 404 (este vira `notFound`). */
  readonly toolsError = computed(() =>
    this.notFound() ? null : errorMessageOf(this.toolsResource.error()),
  );
  /** Upstream fora do ar: as tools somem até ele reconectar. */
  readonly isDown = computed(() => this.header()?.status === 'DOWN');
  readonly authorization = computed(() => this.header()?.authorization ?? null);
  readonly hasNoTools = computed(
    () => this.toolsResource.hasValue() && this.toolsResource.value().length === 0,
  );

  constructor() {
    // Fora do ar ou esperando login: acompanha até subir, para as tools aparecerem sem recarregar a página.
    pollWhileVisible(
      () => {
        if (this.isDown()) {
          this.upstreamsResource.reload();
        }
      },
      this.upstreamsResource.isLoading,
      UPSTREAMS_POLL_INTERVAL_MS,
    );
    // DOWN devolve `[]` de tools: quando vira UP, busca de novo.
    let previous: UpstreamStatus | null = null;
    effect(() => {
      const status = this.header()?.status ?? null;
      if (previous === 'DOWN' && status === 'UP') {
        untracked(() => this.toolsResource.reload());
      }
      previous = status;
    });
  }

  retryHeader(): void {
    this.upstreamsResource.reload();
  }

  retryTools(): void {
    this.toolsResource.reload();
  }

  /** Erro vira snackbar e o toggle volta (não é erro da página); 404 recarrega a lista. */
  setEnabled(tool: ToolDto, enabled: boolean): void {
    if (this.pending().has(tool.name)) {
      return;
    }
    this.setPending(tool.name, enabled);
    this.toolsApi
      .setEnabled(tool.name, enabled)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          if (this.toolsResource.hasValue()) {
            this.toolsResource.update((tools) =>
              tools?.map((t) => (t.name === updated.name ? updated : t)),
            );
          }
          this.setPending(tool.name, null);
          this.notification.notify(
            `${updated.originalName} ${updated.enabled ? 'religada' : 'desligada'}`,
          );
        },
        error: (error: unknown) => {
          this.setPending(tool.name, null);
          const status = httpStatusOf(error);
          if (status === 503) {
            this.notification.notify(DATABASE_DOWN_NOTICE);
          } else if (status === 404) {
            this.notification.notify(`${tool.originalName} saiu do upstream; lista recarregada.`);
            this.toolsResource.reload();
            this.upstreamsResource.reload();
          } else {
            this.notification.notify(`Nada mudou. ${errorMessageOf(error)}`);
          }
        },
      });
  }

  /** O diálogo assina e mostra o link; aqui só o 503 (snackbar) e o 404 (sumiu: volta para a lista). */
  authorize(): Observable<AuthorizeResponse> {
    const key = this.key();
    return this.api.authorize(key).pipe(
      catchError((error: unknown) => {
        const status = httpStatusOf(error);
        if (status === 503) {
          this.notification.notify(DATABASE_DOWN_NOTICE);
        } else if (status === 404) {
          this.notification.notify(`O upstream ${key} não existe mais.`);
          void this.router.navigate(['/', AppPaths.upstreams]);
        }
        return throwError(() => error);
      }),
    );
  }

  /** 204 e 404 voltam para a lista (no 404 ele já não existe); 503 e outros ficam na tela com um aviso. */
  remove(): void {
    if (this.removing()) {
      return;
    }
    const key = this.key();
    this.removing.set(true);
    this.api
      .remove(key)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.removing.set(false);
          this.notification.notify(`Upstream ${key} removido.`);
          void this.router.navigate(['/', AppPaths.upstreams]);
        },
        error: (error: unknown) => {
          this.removing.set(false);
          const status = httpStatusOf(error);
          if (status === 404) {
            this.notification.notify(`O upstream ${key} já não existia.`);
            void this.router.navigate(['/', AppPaths.upstreams]);
          } else if (status === 503) {
            this.notification.notify(DATABASE_DOWN_NOTICE);
          } else {
            this.notification.notify(`Nada mudou. ${errorMessageOf(error)}`);
          }
        },
      });
  }

  private setPending(name: string, enabled: boolean | null): void {
    this.pending.update((current) => {
      const next = new Map(current);
      if (enabled === null) {
        next.delete(name);
      } else {
        next.set(name, enabled);
      }
      return next;
    });
  }
}
