import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CallOutcome } from '../../../../shared/core/api/call.dto';
import { OUTCOME_DESCRIPTIONS } from '../../core/call-labels';
import { CallFilter } from '../../core/call-list.store';

@Component({
  selector: 'got-call-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KeyValuePipe, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  template: `
    <mat-form-field class="text">
      <mat-label>Chave</mat-label>
      <input
        matInput
        [value]="filter().caller"
        (change)="filterChange.emit({ caller: $any($event.target).value })"
        placeholder="cli"
      />
      <mat-hint>Nome exato; Enter aplica</mat-hint>
    </mat-form-field>

    <mat-form-field class="text tool">
      <mat-label>Tool</mat-label>
      <input
        matInput
        [value]="filter().tool"
        (change)="filterChange.emit({ tool: $any($event.target).value })"
        placeholder="filesystem__read_file"
      />
      <mat-hint>Nome exposto exato</mat-hint>
    </mat-form-field>

    <mat-form-field class="outcome">
      <mat-label>Resultado</mat-label>
      <mat-select
        [value]="filter().outcome"
        (selectionChange)="filterChange.emit({ outcome: $event.value })"
      >
        <mat-option [value]="null">Todos</mat-option>
        @for (entry of outcomes | keyvalue: keepOrder; track entry.key) {
          <mat-option [value]="entry.key">{{ entry.key }} · {{ entry.value }}</mat-option>
        }
      </mat-select>
    </mat-form-field>

    @if (filtered()) {
      <button mat-button class="clear" (click)="clear.emit()">Limpar filtros</button>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: var(--got-space-4);
      margin-bottom: var(--got-space-4);
    }

    .text,
    .outcome {
      flex: 0 1 var(--got-field-min-width);
    }

    .tool {
      flex-grow: 1;
    }

    input {
      font-family: var(--got-font-mono);
    }

    .clear {
      margin-top: var(--got-space-2);
    }
  `,
})
export class CallFiltersComponent {
  readonly filter = input.required<CallFilter>();
  readonly filtered = input(false);

  readonly filterChange = output<Partial<CallFilter>>();
  readonly clear = output<void>();

  protected readonly outcomes: Record<CallOutcome, string> = OUTCOME_DESCRIPTIONS;
  protected readonly keepOrder = () => 0;
}
