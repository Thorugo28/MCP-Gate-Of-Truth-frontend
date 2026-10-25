import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { UpstreamStatus } from '../../core/api/upstream.dto';

@Component({
  selector: 'got-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatChipsModule, MatIconModule],
  template: `
    <mat-chip>
      <mat-icon matChipAvatar fontSet="material-symbols-outlined">{{
        isUp() ? 'door_open' : 'door_front'
      }}</mat-icon>
      {{ isUp() ? 'Portão aberto · UP' : 'Portão fechado · DOWN' }}
    </mat-chip>
  `,
  styleUrl: './status-badge.component.scss',
  host: { '[class.up]': 'isUp()' },
})
export class StatusBadgeComponent {
  readonly status = input.required<UpstreamStatus>();

  protected readonly isUp = computed(() => this.status() === 'UP');
}
