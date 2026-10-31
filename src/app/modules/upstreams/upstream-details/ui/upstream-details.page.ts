import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppPaths } from '../../../shared/core/routes/app-paths';
import {
  AuthorizeDialogComponent,
  AuthorizeDialogData,
} from '../../../shared/ui/authorize-dialog/authorize-dialog.component';
import { ErrorStateComponent } from '../../../shared/ui/error-state/error-state.component';
import { TransmutationLoaderComponent } from '../../../shared/ui/transmutation-loader/transmutation-loader.component';
import { UpstreamDetailsStore } from '../core/upstream-details.store';
import { ToolListComponent } from './tool-list/tool-list.component';
import { UpstreamDefinitionComponent } from './upstream-definition/upstream-definition.component';
import { UpstreamHeaderComponent } from './upstream-header/upstream-header.component';
import {
  UpstreamRemoveDialogComponent,
  UpstreamRemoveDialogData,
} from './upstream-remove-dialog/upstream-remove-dialog.component';

@Component({
  selector: 'got-upstream-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink,
    ErrorStateComponent,
    TransmutationLoaderComponent,
    ToolListComponent,
    UpstreamDefinitionComponent,
    UpstreamHeaderComponent,
  ],
  providers: [UpstreamDetailsStore],
  templateUrl: './upstream-details.page.html',
  styleUrl: './upstream-details.page.scss',
})
export class UpstreamDetailsPage {
  protected readonly store = inject(UpstreamDetailsStore);
  protected readonly upstreamsLink = ['/', AppPaths.upstreams];
  private readonly dialog = inject(MatDialog);

  protected openAuthorize(): void {
    this.dialog.open<AuthorizeDialogComponent, AuthorizeDialogData>(AuthorizeDialogComponent, {
      data: { key: this.store.key(), authorize: () => this.store.authorize() },
      width: 'var(--got-dialog-width)',
    });
  }

  protected confirmRemove(): void {
    this.dialog
      .open<UpstreamRemoveDialogComponent, UpstreamRemoveDialogData, boolean>(
        UpstreamRemoveDialogComponent,
        { data: { key: this.store.key() } },
      )
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.store.remove();
        }
      });
  }
}
