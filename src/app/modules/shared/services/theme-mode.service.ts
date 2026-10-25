import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'got-theme-mode';

/**
 * Claro/escuro: segue o sistema até o usuário forçar um modo pelo botão da toolbar.
 * O modo forçado vai para `localStorage` e para `<html data-theme>`, que o styles.scss lê.
 */
@Injectable({ providedIn: 'root' })
export class ThemeModeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)');

  private readonly systemMode = signal<ThemeMode>(this.media?.matches ? 'dark' : 'light');
  private readonly forcedMode = signal<ThemeMode | null>(this.readStored());

  readonly mode = computed(() => this.forcedMode() ?? this.systemMode());

  constructor() {
    this.media?.addEventListener('change', (e) =>
      this.systemMode.set(e.matches ? 'dark' : 'light'),
    );

    effect(() => {
      const forced = this.forcedMode();
      const root = this.document.documentElement;
      if (forced) {
        root.dataset['theme'] = forced;
      } else {
        delete root.dataset['theme'];
      }
    });
  }

  toggle(): void {
    const next: ThemeMode = this.mode() === 'dark' ? 'light' : 'dark';
    this.forcedMode.set(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Sem storage (modo privado etc.): o modo vale só para esta aba.
    }
  }

  private readStored(): ThemeMode | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      return null;
    }
  }
}
