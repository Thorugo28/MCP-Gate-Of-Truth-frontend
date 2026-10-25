import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Loading do painel: círculo de transmutação girando (parado com `prefers-reduced-motion`). */
@Component({
  selector: 'got-transmutation-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <g fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="24" cy="24" r="22" />
        <circle cx="24" cy="24" r="17" />
        <path d="M24 7 38.7 32.5H9.3z" />
        <path d="M24 41 9.3 15.5h29.4z" />
        <circle cx="24" cy="24" r="5" />
      </g>
    </svg>
    <span>{{ label() }}</span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--got-space-4);
      padding: var(--got-space-4) 0;
      color: var(--mat-sys-on-surface-variant);
    }

    svg {
      flex: none;
      width: var(--got-loader-size);
      height: var(--got-loader-size);
      color: var(--got-accent-text);
      animation: got-transmute 4s linear infinite;
    }

    @keyframes got-transmute {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      svg {
        animation: none;
      }
    }
  `,
  host: { role: 'status' },
})
export class TransmutationLoaderComponent {
  readonly label = input.required<string>();
}
