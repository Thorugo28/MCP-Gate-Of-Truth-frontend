import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ErrorStateComponent } from '../../../shared/ui/error-state/error-state.component';
import { TransmutationLoaderComponent } from '../../../shared/ui/transmutation-loader/transmutation-loader.component';
import { KeyListStore, KeyRow } from '../core/key-list.store';
import {
  KeyCreateDialogComponent,
  KeyCreateDialogData,
} from './key-create-dialog/key-create-dialog.component';
import {
  KeyRevokeDialogComponent,
  KeyRevokeDialogData,
} from './key-revoke-dialog/key-revoke-dialog.component';
import { KeyTableComponent } from './key-table/key-table.component';

@Component({
  selector: 'got-key-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    ErrorStateComponent,
    TransmutationLoaderComponent,
    KeyTableComponent,
  ],
  providers: [KeyListStore],
  templateUrl: './key-list.page.html',
  styleUrl: './key-list.page.scss',
})
export class KeyListPage {
  protected readonly store = inject(KeyListStore);
  private readonly dialog = inject(MatDialog);

  protected openCreate(): void {
    this.dialog.open<KeyCreateDialogComponent, KeyCreateDialogData>(KeyCreateDialogComponent, {
      data: {
        upstreams: this.store.upstreamKeys,
        mcpUrl: this.store.mcpUrl,
        create: (request) => this.store.create(request),
      },
      // Fecha só pelos botões: o valor não pode sumir por um clique fora.
      disableClose: true,
      width: 'var(--got-dialog-width)',
    });
  }

  protected confirmRevoke(row: KeyRow): void {
    this.dialog
      .open<KeyRevokeDialogComponent, KeyRevokeDialogData, boolean>(KeyRevokeDialogComponent, {
        data: { name: row.name, admin: row.admin },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.revoke(row.name);
        }
      });
  }
}
