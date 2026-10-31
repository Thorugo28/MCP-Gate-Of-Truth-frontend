import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ErrorStateComponent } from '../../../shared/ui/error-state/error-state.component';
import { TransmutationLoaderComponent } from '../../../shared/ui/transmutation-loader/transmutation-loader.component';
import { CALLS_LIMIT, CallListStore } from '../core/call-list.store';
import { CallFiltersComponent } from './call-filters/call-filters.component';
import { CallTableComponent } from './call-table/call-table.component';

@Component({
  selector: 'got-call-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatIconModule,
    ErrorStateComponent,
    TransmutationLoaderComponent,
    CallFiltersComponent,
    CallTableComponent,
  ],
  providers: [CallListStore],
  templateUrl: './call-list.page.html',
  styleUrl: './call-list.page.scss',
})
export class CallListPage {
  protected readonly store = inject(CallListStore);
  protected readonly limit = CALLS_LIMIT;
}
