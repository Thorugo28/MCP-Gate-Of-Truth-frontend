import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../../../shared/core/api/api-base-url';
import {
  CreatedKeyDto,
  CreateKeyRequest,
  KeyDto,
  KeyOrigin,
} from '../../../shared/core/api/key.dto';
import { KeysApi } from '../../../shared/core/api/keys.api';
import { UpstreamsApi } from '../../../shared/core/api/upstreams.api';
import { errorMessageOf, httpStatusOf } from '../../../shared/core/http/http-error';
import {
  DATABASE_DOWN_NOTICE,
  NotificationService,
} from '../../../shared/services/notification.service';
import { byLabel, originLabel } from '../../../shared/utils/record-labels';
import { upstreamLabels } from './key-labels';

export interface KeyRow {
  name: string;
  origin: KeyOrigin;
  originLabel: string;
  /** Um chip por item: "todos", "nenhum" ou as chaves dos upstreams. */
  upstreams: string[];
  admin: boolean;
  /** `"26/10 por painel"`; `null` nas do yml. */
  created: string | null;
  /** `"Ativa"` ou `"Revogada em 26/10 por painel"`. */
  status: string;
  revoked: boolean;
  /** Só as do painel ainda ativas; as do yml se mudam no application.yml. */
  canRevoke: boolean;
}

function toRow(dto: KeyDto): KeyRow {
  const revoked = dto.revokedAt !== null;
  return {
    name: dto.name,
    origin: dto.origin,
    originLabel: originLabel(dto.origin),
    upstreams: upstreamLabels(dto.upstreams),
    admin: dto.admin,
    created: dto.createdAt ? byLabel(dto.createdAt, dto.createdBy) : null,
    status: dto.revokedAt ? `Revogada em ${byLabel(dto.revokedAt, dto.revokedBy)}` : 'Ativa',
    revoked,
    canRevoke: dto.origin === 'panel' && !revoked,
  };
}

/**
 * Fornecido na página. Sem polling: recarrega depois de criar ou revogar.
 * O valor de uma chave criada nunca passa por aqui além do repasse em `create`: quem mostra é o diálogo.
 */
@Injectable()
export class KeyListStore {
  private readonly api = inject(KeysApi);
  private readonly upstreamsApi = inject(UpstreamsApi);
  private readonly notification = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  /** Endereço do `/mcp` do gateway, para o comando do Claude Code. */
  readonly mcpUrl = `${inject(API_BASE_URL)}/mcp`;

  readonly showRevoked = signal(false);
  /** Nome da chave com o DELETE em voo. */
  readonly revoking = signal<string | null>(null);

  private readonly resource = rxResource({ stream: () => this.api.list() });
  private readonly upstreamsResource = rxResource({ stream: () => this.upstreamsApi.list() });

  private readonly allRows = computed(() =>
    (this.resource.hasValue() ? this.resource.value() : []).map(toRow),
  );
  readonly rows = computed(() =>
    this.showRevoked() ? this.allRows() : this.allRows().filter((r) => !r.revoked),
  );
  readonly revokedCount = computed(() => this.allRows().filter((r) => r.revoked).length);
  readonly isLoading = this.resource.isLoading;
  readonly isFirstLoad = computed(() => this.resource.isLoading() && !this.resource.hasValue());
  readonly errorMessage = computed(() =>
    httpStatusOf(this.resource.error()) === 503
      ? 'O banco do gateway está fora do ar; as chaves do painel não aparecem até ele voltar.'
      : errorMessageOf(this.resource.error()),
  );
  readonly isEmpty = computed(() => this.resource.hasValue() && this.rows().length === 0);

  /** Chaves dos upstreams para o formulário de nova chave; vazio se a lista não carregou. */
  readonly upstreamKeys = computed(() =>
    this.upstreamsResource.hasValue() ? this.upstreamsResource.value().map((u) => u.key) : [],
  );

  refresh(): void {
    this.resource.reload();
  }

  /** O diálogo assina e mostra o valor; aqui só recarrega a lista e avisa do 503. */
  create(request: CreateKeyRequest): Observable<CreatedKeyDto> {
    return this.api.create(request).pipe(
      tap(() => this.resource.reload()),
      catchError((error: unknown) => {
        if (httpStatusOf(error) === 503) {
          this.notification.notify(DATABASE_DOWN_NOTICE);
        }
        return throwError(() => error);
      }),
    );
  }

  /** Revogar a chave do próprio painel faz o recarregamento dar 401, e o interceptor leva para `/chave`. */
  revoke(name: string): void {
    if (this.revoking() !== null) {
      return;
    }
    this.revoking.set(name);
    this.api
      .revoke(name)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.revoking.set(null);
          this.notification.notify(`Chave ${name} revogada.`);
          this.resource.reload();
        },
        error: (error: unknown) => {
          this.revoking.set(null);
          const status = httpStatusOf(error);
          if (status === 503) {
            this.notification.notify(DATABASE_DOWN_NOTICE);
          } else if (status === 404) {
            this.notification.notify(`A chave ${name} não existe mais; lista recarregada.`);
            this.resource.reload();
          } else {
            this.notification.notify(`Nada mudou. ${errorMessageOf(error)}`);
          }
        },
      });
  }
}
