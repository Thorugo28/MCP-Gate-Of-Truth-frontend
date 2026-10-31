import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CallFilter, CallRow } from '../../core/call-list.store';
import { OutcomeBadgeComponent } from '../outcome-badge/outcome-badge.component';

@Component({
  selector: 'got-call-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatTableModule, OutcomeBadgeComponent],
  templateUrl: './call-table.component.html',
  styleUrl: './call-table.component.scss',
})
export class CallTableComponent {
  readonly rows = input.required<CallRow[]>();

  /** Clique na chave ou na tool de uma linha filtra por ela. */
  readonly filterBy = output<Partial<CallFilter>>();

  protected readonly columns = ['time', 'caller', 'via', 'tool', 'outcome', 'duration'];
}
