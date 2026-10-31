import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { AuthorizeResponse } from '../../core/api/upstream.dto';
import { errorMessageOf, httpStatusOf, serverErrorOf } from '../../core/http/http-error';
import { TransmutationLoaderComponent } from '../transmutation-loader/transmutation-loader.component';

export interface AuthorizeDialogData {
  key: string;
  /** Quem chama já trata 503 (snackbar) e 404 (volta ou recarrega); o diálogo fecha nesses dois. */
  authorize: () => Observable<AuthorizeResponse>;
}

/**
 * Pede o link do login ao abrir e mostra como `<a target="_blank">`: o clique da pessoa abre a aba, sem `window.open`
 * depois da resposta (o navegador bloquearia o popup). O link tem o `state` do OAuth, então vive só num signal daqui
 * (nada de store, storage, log ou URL do painel) e some quando o diálogo fecha. Fechar não cancela nada no gateway.
 */
@Component({
  selector: 'got-authorize-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, MatIconModule, TransmutationLoaderComponent],
  template: `
    <h2 mat-dialog-title>Autorizar {{ data.key }}</h2>
    <mat-dialog-content>
      @if (url(); as url) {
        <p>
          Faça login e permita o acesso. Depois volte aqui: o upstream conecta sozinho em alguns
          segundos. O link vale 10 minutos.
        </p>
        <a mat-flat-button [href]="url" target="_blank" rel="noopener noreferrer">
          <mat-icon fontSet="material-symbols-outlined">open_in_new</mat-icon>
          Abrir login do Notion
        </a>
      } @else if (error(); as error) {
        <p class="error" role="alert">{{ error }}</p>
      } @else {
        <got-transmutation-loader label="Pedindo o link de login ao gateway…" />
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: `
    p {
      margin: 0 0 var(--got-space-4);
    }

    .error {
      color: var(--got-danger);
    }
  `,
})
export class AuthorizeDialogComponent implements OnInit {
  protected readonly data = inject<AuthorizeDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AuthorizeDialogComponent>);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly url = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.data
      .authorize()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ authorizationUrl }) => this.url.set(authorizationUrl),
        error: (error: unknown) => {
          const status = httpStatusOf(error);
          if (status === 503 || status === 404) {
            this.dialogRef.close();
            return;
          }
          this.error.set(serverErrorOf(error) ?? errorMessageOf(error));
        },
      });
  }
}
