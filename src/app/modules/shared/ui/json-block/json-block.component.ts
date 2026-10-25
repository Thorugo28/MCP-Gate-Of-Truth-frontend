import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Bloco de JSON formatado (indentação de 2), só leitura. */
@Component({
  selector: 'got-json-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<pre>{{ formatted() }}</pre>`,
  styleUrl: './json-block.component.scss',
})
export class JsonBlockComponent {
  readonly value = input.required<unknown>();

  protected readonly formatted = computed(() => JSON.stringify(this.value(), null, 2));
}
