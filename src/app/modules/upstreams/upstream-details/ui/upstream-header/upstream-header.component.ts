import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { StatusBadgeComponent } from '../../../../shared/ui/status-badge/status-badge.component';
import { originLabel } from '../../../../shared/utils/record-labels';
import { UpstreamHeader } from '../../core/upstream-details.store';

@Component({
  selector: 'got-upstream-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatChipsModule, StatusBadgeComponent],
  template: `
    <got-status-badge [status]="header().status" />
    <mat-chip>{{ origin() }}</mat-chip>
    @switch (header().authorization) {
      @case ('NEEDED') {
        <mat-chip class="needed">Autorização necessária</mat-chip>
      }
      @case ('OK') {
        <span class="authorized">Autorizado</span>
      }
    }
    <span>{{ header().server }}</span>
    <span class="count">{{ header().tools }}</span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--got-space-4);
      flex-wrap: wrap;
      color: var(--mat-sys-on-surface-variant);
    }

    .needed {
      --mat-chip-label-text-color: var(--got-danger);
      --mat-chip-outline-color: var(--got-danger);
    }

    .authorized {
      font: var(--mat-sys-body-small);
    }
  `,
})
export class UpstreamHeaderComponent {
  readonly header = input.required<UpstreamHeader>();

  protected readonly origin = computed(() => originLabel(this.header().origin));
}
