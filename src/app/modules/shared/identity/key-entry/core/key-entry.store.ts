import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AccessKeyApi } from '../../../core/api/access-key.api';
import { errorMessageOf, httpStatusOf } from '../../../core/http/http-error';
import { AppPaths } from '../../../core/routes/app-paths';
import { AccessKeyService } from '../../access-key.service';

function rejectionMessage(error: unknown): string | null {
  switch (httpStatusOf(error)) {
    case 401:
      return 'Chave inválida. Confira o valor de GATE_KEY_PANEL no gateway.';
    case 403:
      return 'Esta chave não tem acesso ao painel. Use a chave com admin: true (GATE_KEY_PANEL).';
    default:
      return errorMessageOf(error);
  }
}

/** Testa a chave colada no gateway; só guarda se ela valer para o painel. */
@Injectable()
export class KeyEntryStore {
  private readonly api = inject(AccessKeyApi);
  private readonly accessKey = inject(AccessKeyService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly key = signal('');
  readonly remember = signal(false);
  readonly isVerifying = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly notice = this.accessKey.notice.asReadonly();

  readonly canSubmit = computed(() => this.key().trim() !== '' && !this.isVerifying());

  setKey(key: string): void {
    this.key.set(key);
    this.errorMessage.set(null);
  }

  submit(): void {
    const key = this.key().trim();
    if (!this.canSubmit()) {
      return;
    }
    this.errorMessage.set(null);
    this.isVerifying.set(true);
    this.api
      .verify(key)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.accessKey.save(key, this.remember());
          this.isVerifying.set(false);
          void this.router.navigate(['/', AppPaths.upstreams]);
        },
        error: (error: unknown) => {
          this.errorMessage.set(rejectionMessage(error));
          this.isVerifying.set(false);
        },
      });
  }
}
