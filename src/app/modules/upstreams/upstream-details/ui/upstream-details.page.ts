import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppPaths } from '../../../shared/core/routes/app-paths';
import { ErrorStateComponent } from '../../../shared/ui/error-state/error-state.component';
import { TransmutationLoaderComponent } from '../../../shared/ui/transmutation-loader/transmutation-loader.component';
import { UpstreamDetailsStore } from '../core/upstream-details.store';
import { ToolListComponent } from './tool-list/tool-list.component';
import { UpstreamHeaderComponent } from './upstream-header/upstream-header.component';

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
    UpstreamHeaderComponent,
  ],
  providers: [UpstreamDetailsStore],
  templateUrl: './upstream-details.page.html',
  styleUrl: './upstream-details.page.scss',
})
export class UpstreamDetailsPage {
  protected readonly store = inject(UpstreamDetailsStore);
  protected readonly upstreamsLink = ['/', AppPaths.upstreams];
}
