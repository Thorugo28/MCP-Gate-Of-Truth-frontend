import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { errorMessageOf, httpStatusOf } from '../../../shared/core/http/http-error';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';
import {
  AuthorizeResponse,
  CreateUpstreamRequest,
  UpstreamAuthorization,
  UpstreamDto,
  UpstreamOrigin,
  UpstreamStatus,
} from '../../../shared/core/api/upstream.dto';
import {
  nowSignal,
  pollWhileVisible,
  UPSTREAMS_POLL_INTERVAL_MS,
} from '../../../shared/core/state/polling';
import {
  DATABASE_DOWN_NOTICE,
  NotificationService,
} from '../../../shared/services/notification.service';
import { originLabel } from '../../../shared/utils/record-labels';
import { retryLabel, serverLabel } from '../../../shared/utils/upstream-labels';

export interface UpstreamRow {
  key: string;
  status: UpstreamStatus;
  origin: UpstreamOrigin;
  originLabel: string;
  /** `"<nome> <versão>"` anunciado pelo servidor, ou `"—"` quando DOWN. */
  server: string;
  toolCount: number;
  /** `"tentativa N · próxima em 42s"` quando DOWN, ou `"conectando…"` logo depois do cadastro. */
  retry: string | null;
  /** `NEEDED`: espera alguém autorizar (sem próxima tentativa); `null` = sem OAuth. */
  authorization: UpstreamAuthorization | null;
}

function toRow(dto: UpstreamDto, now: number): UpstreamRow {
  // Do painel, DOWN e sem tentativa: acabou de ser cadastrado e espera a próxima rodada do health check.
  const connecting = dto.origin === 'panel' && dto.status === 'DOWN' && dto.attempts === 0;
  return {
    key: dto.key,
    status: dto.status,
    origin: dto.origin,
    originLabel: originLabel(dto.origin),
    server: serverLabel(dto),
    toolCount: dto.toolCount,
    // Esperando login não tem próxima tentativa: o chip "Autorização necessária" fica no lugar.
    retry:
      dto.authorization === 'NEEDED' ? null : connecting ? 'conectando…' : retryLabel(dto, now),
    authorization: dto.authorization,
  };
}

/**
 * Fornecido na página: morre com a tela, e o polling junto. O backend responde com o status guardado
 * pelo health check (rápido), então a lista se atualiza sozinha a cada `UPSTREAMS_POLL_INTERVAL_MS`.
 */
@Injectable()
export class UpstreamListStore {
  private readonly api = inject(UpstreamsApi);
  private readonly notification = inject(NotificationService);
  private readonly now = nowSignal();

  private readonly resource = rxResource({ stream: () => this.api.list() });
  private readonly commandsResource = rxResource({ stream: () => this.api.allowedCommands() });

  readonly rows = computed(() =>
    (this.resource.hasValue() ? this.resource.value() : []).map((dto) => toRow(dto, this.now())),
  );
  readonly isLoading = this.resource.isLoading;
  /** Só a primeira carga (ou depois de erro): os recarregamentos do polling não piscam o loading. */
  readonly isFirstLoad = computed(() => this.resource.isLoading() && !this.resource.hasValue());
  readonly errorMessage = computed(() => errorMessageOf(this.resource.error()));
  readonly isEmpty = computed(() => this.resource.hasValue() && this.resource.value().length === 0);

  /** Sugestões do campo comando; vazio se não carregou (o campo aceita texto livre e quem decide é o back). */
  readonly allowedCommands = computed(() =>
    this.commandsResource.hasValue() ? this.commandsResource.value() : [],
  );

  constructor() {
    pollWhileVisible(() => this.resource.reload(), this.isLoading, UPSTREAMS_POLL_INTERVAL_MS);
  }

  refresh(): void {
    this.resource.reload();
  }

  /** O diálogo assina e mostra os erros de campo; aqui avisa, recarrega a lista e trata o 503. */
  create(request: CreateUpstreamRequest): Observable<UpstreamDto> {
    return this.api.create(request).pipe(
      tap((created) => {
        this.notification.notify(`${created.key} cadastrado, conectando…`);
        this.resource.reload();
      }),
      catchError((error: unknown) => {
        if (httpStatusOf(error) === 503) {
          this.notification.notify(DATABASE_DOWN_NOTICE);
        }
        return throwError(() => error);
      }),
    );
  }

  /** O diálogo assina e mostra o link; aqui só o 503 (snackbar) e o 404 (sumiu: recarrega). */
  authorize(key: string): Observable<AuthorizeResponse> {
    return this.api.authorize(key).pipe(
      catchError((error: unknown) => {
        const status = httpStatusOf(error);
        if (status === 503) {
          this.notification.notify(DATABASE_DOWN_NOTICE);
        } else if (status === 404) {
          this.notification.notify(`O upstream ${key} não existe mais; lista recarregada.`);
          this.resource.reload();
        }
        return throwError(() => error);
      }),
    );
  }
}
