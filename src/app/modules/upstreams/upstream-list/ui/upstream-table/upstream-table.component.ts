import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { upstreamDetailsLink } from '../../../../shared/core/routes/app-paths';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { UpstreamRow } from '../../core/upstream-list.store';

@Component({
  selector: 'got-upstream-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatTableModule,
    RouterLink,
    StatusBadgeComponent,
  ],
  templateUrl: './upstream-table.component.html',
  styleUrl: './upstream-table.component.scss',
})
export class UpstreamTableComponent {
  readonly rows = input.required<UpstreamRow[]>();
  /** Chave do upstream que espera login. */
  readonly authorize = output<string>();

  protected readonly columns = ['key', 'origin', 'status', 'server', 'toolCount'];
  protected readonly detailsLink = upstreamDetailsLink;
}
