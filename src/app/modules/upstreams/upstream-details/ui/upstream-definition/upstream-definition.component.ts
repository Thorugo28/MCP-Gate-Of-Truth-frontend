import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { UpstreamDefinition } from '../../core/upstream-details.store';

/** Como o upstream do painel foi cadastrado; `null` é um upstream do application.yml. */
@Component({
  selector: 'got-upstream-definition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (definition(); as d) {
      <dl>
        <dt>Comando</dt>
        <dd>
          <code>{{ d.command }}</code>
        </dd>

        <dt>Argumentos</dt>
        <dd>
          @if (d.args.length > 0) {
            <ol>
              @for (arg of d.args; track $index) {
                <li>
                  <code>{{ arg }}</code>
                </li>
              }
            </ol>
          } @else {
            —
          }
        </dd>

        <dt>Ambiente</dt>
        <dd>
          @if (d.env.length > 0) {
            <ul>
              @for (entry of d.env; track entry.name) {
                <li>
                  <code>{{ entry.name }}={{ entry.value }}</code>
                </li>
              }
            </ul>
          } @else {
            —
          }
        </dd>

        @if (d.created) {
          <dt>Cadastrado</dt>
          <dd>{{ d.created }}</dd>
        }
      </dl>
    } @else {
      <p class="muted">Definido no <code>application.yml</code>; só muda lá.</p>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    dl {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: var(--got-space-2) var(--got-space-6);
      margin: 0;
      padding: var(--got-space-4);
      border: var(--got-border-line);
      border-radius: var(--mat-sys-corner-medium);
    }

    dt {
      color: var(--mat-sys-on-surface-variant);
    }

    dd,
    ol,
    ul,
    p {
      margin: 0;
    }

    ol,
    ul {
      padding-left: var(--got-space-6);
    }

    code {
      font-family: var(--got-font-mono);
      word-break: break-all;
    }

    .muted {
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class UpstreamDefinitionComponent {
  readonly definition = input.required<UpstreamDefinition | null>();
}
