import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ErrorStateComponent } from '../../../shared/ui/error-state/error-state.component';
import { TransmutationLoaderComponent } from '../../../shared/ui/transmutation-loader/transmutation-loader.component';
import { UpstreamListStore } from '../core/upstream-list.store';
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
  templateUrl: './upstream-list.page.html',
  styleUrl: './upstream-list.page.scss',
})
export class UpstreamListPage {
  protected readonly store = inject(UpstreamListStore);
}
