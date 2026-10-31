import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface UpstreamRemoveDialogData {
  key: string;
}

/** Confirmação de remover; fecha com `true` para remover. */
@Component({
  selector: 'got-upstream-remove-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Remover {{ data.key }}?</h2>
    <mat-dialog-content>
      <p>
        As tools de <code>{{ data.key }}</code> somem na hora para todos os clientes. Chaves que
        citam <code>{{ data.key }}</code> continuam citando e voltam a vê-lo se ele for cadastrado
        de novo com a mesma chave.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button class="danger" [mat-dialog-close]="true">Remover</button>
    </mat-dialog-actions>
  `,
  styles: `
    code {
      font-family: var(--got-font-mono);
    }

    .danger {
      --mat-button-filled-container-color: var(--got-danger);
      --mat-button-filled-label-text-color: var(--got-surface);
    }
  `,
})
export class UpstreamRemoveDialogComponent {
  protected readonly data = inject<UpstreamRemoveDialogData>(MAT_DIALOG_DATA);
}
