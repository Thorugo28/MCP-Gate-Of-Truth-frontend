import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KeyRow } from '../../core/key-list.store';

@Component({
  selector: 'got-key-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatChipsModule, MatIconModule, MatTableModule, MatTooltipModule],
  templateUrl: './key-table.component.html',
  styleUrl: './key-table.component.scss',
})
export class KeyTableComponent {
  readonly rows = input.required<KeyRow[]>();
  /** Nome da chave com a revogação em voo: o botão dela fica desabilitado. */
  readonly revoking = input<string | null>(null);

  readonly revoke = output<KeyRow>();

  protected readonly columns = [
    'name',
    'origin',
    'upstreams',
    'admin',
    'created',
    'status',
    'actions',
  ];
}
