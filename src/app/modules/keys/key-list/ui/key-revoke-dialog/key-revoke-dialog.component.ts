import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface KeyRevokeDialogData {
  name: string;
  admin: boolean;
}

/** Confirmação de revogar; fecha com `true` para revogar. */
@Component({
  selector: 'got-key-revoke-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Revogar {{ data.name }}?</h2>
    <mat-dialog-content>
      <p>
        Quem usa a chave <code>{{ data.name }}</code> perde o acesso na hora. Não dá para desfazer
        nem reaproveitar o nome.
      </p>
      @if (data.admin) {
        <p>Se for a chave deste painel, você volta para a tela de chave.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button class="danger" [mat-dialog-close]="true">Revogar</button>
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
export class KeyRevokeDialogComponent {
  protected readonly data = inject<KeyRevokeDialogData>(MAT_DIALOG_DATA);
}
