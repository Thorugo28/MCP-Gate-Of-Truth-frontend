import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  AuthorizeDialogComponent,
  AuthorizeDialogData,
} from '../../../shared/ui/authorize-dialog/authorize-dialog.component';
import { ErrorStateComponent } from '../../../shared/ui/error-state/error-state.component';
import { TransmutationLoaderComponent } from '../../../shared/ui/transmutation-loader/transmutation-loader.component';
import { UpstreamListStore } from '../core/upstream-list.store';
import {
  UpstreamCreateDialogComponent,
  UpstreamCreateDialogData,
} from './upstream-create-dialog/upstream-create-dialog.component';
import { UpstreamTableComponent } from './upstream-table/upstream-table.component';

@Component({
  selector: 'got-upstream-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    ErrorStateComponent,
    TransmutationLoaderComponent,
    UpstreamTableComponent,
  ],
  providers: [UpstreamListStore],
  templateUrl: './upstream-list.page.html',
  styleUrl: './upstream-list.page.scss',
})
export class UpstreamListPage {
  protected readonly store = inject(UpstreamListStore);
  private readonly dialog = inject(MatDialog);

  protected openCreate(): void {
    this.dialog.open<UpstreamCreateDialogComponent, UpstreamCreateDialogData>(
      UpstreamCreateDialogComponent,
      {
        data: {
          allowedCommands: this.store.allowedCommands,
          create: (request) => this.store.create(request),
        },
        // Fecha só pelos botões: um clique fora não pode jogar o formulário fora.
        disableClose: true,
        width: 'var(--got-dialog-width)',
      },
    );
  }

  protected openAuthorize(key: string): void {
    this.dialog.open<AuthorizeDialogComponent, AuthorizeDialogData>(AuthorizeDialogComponent, {
      data: { key, authorize: () => this.store.authorize(key) },
      width: 'var(--got-dialog-width)',
    });
  }
}
