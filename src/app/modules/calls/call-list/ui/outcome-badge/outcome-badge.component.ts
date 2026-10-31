import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CallOutcome } from '../../../../shared/core/api/call.dto';

const ICONS: Record<CallOutcome, string> = {
  OK: 'check_circle',
  TOOL_ERROR: 'error',
  TIMEOUT: 'timer_off',
  UNAVAILABLE: 'door_front',
  FAILURE: 'report',
};

@Component({
  selector: 'got-outcome-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatChipsModule, MatIconModule],
  template: `
    <mat-chip>
      <mat-icon matChipAvatar fontSet="material-symbols-outlined">{{ icon() }}</mat-icon>
      {{ outcome() }}
    </mat-chip>
  `,
  styleUrl: './outcome-badge.component.scss',
  host: { '[class.up]': 'isOk()' },
})
export class OutcomeBadgeComponent {
  readonly outcome = input.required<CallOutcome>();

  protected readonly isOk = computed(() => this.outcome() === 'OK');
  protected readonly icon = computed(() => ICONS[this.outcome()]);
}
