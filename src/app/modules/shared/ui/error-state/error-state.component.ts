import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'got-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <mat-icon fontSet="material-symbols-outlined">cloud_off</mat-icon>
    <span class="message">{{ message() }}</span>
    <button mat-stroked-button (click)="retry.emit()">Tentar de novo</button>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--got-space-3);
      padding: var(--got-space-4);
      margin: var(--got-space-4) 0;
      border: var(--got-border-line);
      border-color: var(--got-danger);
      border-radius: var(--mat-sys-corner-small);
      background: var(--got-surface);
    }

    mat-icon {
      color: var(--got-danger);
    }

    .message {
      flex: 1;
    }
  `,
})
export class ErrorStateComponent {
  readonly message = input.required<string>();

  readonly retry = output<void>();
}
