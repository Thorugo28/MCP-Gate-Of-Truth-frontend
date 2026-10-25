import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { UpstreamHeader } from '../../core/upstream-details.store';

@Component({
  selector: 'got-upstream-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StatusBadgeComponent],
  template: `
    <got-status-badge [status]="header().status" />
    <span>{{ header().server }}</span>
    <span class="count">{{ header().toolCount }} tools</span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--got-space-4);
      flex-wrap: wrap;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class UpstreamHeaderComponent {
  readonly header = input.required<UpstreamHeader>();
}
