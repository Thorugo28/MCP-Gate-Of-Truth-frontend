import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'got-arguments-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <mat-form-field>
      <mat-label>Argumentos (JSON)</mat-label>
      <textarea
        matInput
        rows="8"
        spellcheck="false"
        [value]="text()"
        (input)="textChange.emit($any($event.target).value)"
      ></textarea>
      @if (error(); as error) {
        <mat-hint class="error">{{ error }}</mat-hint>
      }
    </mat-form-field>
  `,
  styles: `
    mat-form-field {
      width: 100%;
    }

    textarea {
      font-family: var(--got-font-mono);
    }

    .error {
      color: var(--got-danger);
    }
  `,
})
export class ArgumentsEditorComponent {
  readonly text = input.required<string>();
  readonly error = input<string | null>(null);

  readonly textChange = output<string>();
}
