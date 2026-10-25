import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Silhueta do Portão da Verdade, de uma cor só (herda `currentColor`). */
@Component({
  selector: 'got-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M3 4h26v3h-2v21h2v2H3v-2h2V7H3zm5 3v21h7.25V7zm8.75 0v21H24V7zM10 10h3.5v15H10zm8.5 0H22v15h-3.5z"
      />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      width: var(--got-logo-size);
      height: var(--got-logo-size);
    }

    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class LogoComponent {}
