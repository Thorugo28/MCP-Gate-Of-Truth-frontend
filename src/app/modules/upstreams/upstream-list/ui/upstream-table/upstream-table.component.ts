import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { upstreamDetailsLink } from '../../../../shared/core/routes/app-paths';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { UpstreamRow } from '../../core/upstream-list.store';

@Component({
  selector: 'got-upstream-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTableModule, RouterLink, StatusBadgeComponent],
  templateUrl: './upstream-table.component.html',
  styleUrl: './upstream-table.component.scss',
})
export class UpstreamTableComponent {
  readonly rows = input.required<UpstreamRow[]>();

  protected readonly columns = ['key', 'status', 'server', 'toolCount'];
  protected readonly detailsLink = upstreamDetailsLink;
}
