import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { JsonBlockComponent } from '../../../../shared/ui/json-block/json-block.component';
import { ToolCallResult } from '../../core/tool-call.store';

@Component({
  selector: 'got-call-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, JsonBlockComponent],
  template: `
    <p class="outcome" [class.error]="result().isError">
      <mat-icon fontSet="material-symbols-outlined">{{
        result().isError ? 'error' : 'check_circle'
      }}</mat-icon>
      {{ result().isError ? 'A tool respondeu com erro (isError: true)' : 'Sucesso' }}
    </p>
    <got-json-block [value]="result().raw" />
  `,
  styles: `
    .outcome {
      display: flex;
      align-items: center;
      gap: var(--got-space-2);
      color: var(--got-up);
    }

    .outcome.error {
      color: var(--got-danger);
    }
  `,
})
export class CallResultComponent {
  readonly result = input.required<ToolCallResult>();
}
