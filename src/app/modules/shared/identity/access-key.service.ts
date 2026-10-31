import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { accessKeyLink } from '../core/routes/app-paths';

const STORAGE_KEY = 'got-access-key';

/**
 * Chave de acesso do painel (`admin: true` no gateway). Fica em `sessionStorage` (some ao fechar a aba)
 * ou, com "lembrar neste navegador", em `localStorage`. Nunca vai para log, URL nem mensagem de erro.
 */
@Injectable({ providedIn: 'root' })
export class AccessKeyService {
  private readonly router = inject(Router);

  private readonly stored = signal<string | null>(readStored());

  readonly key = this.stored.asReadonly();
  readonly hasKey = computed(() => this.stored() !== null);
  /** Aviso para a tela de chave quando o gateway recusou a chave guardada. */
  readonly notice = signal<string | null>(null);

  save(key: string, remember: boolean): void {
    this.stored.set(key);
    this.notice.set(null);
    clearStorage();
    try {
      (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, key);
    } catch {
      // Sem storage (modo privado etc.): a chave vale só até recarregar a página.
    }
  }

  /** Botão "Sair": apaga a chave e volta para a tela de chave. */
  signOut(): void {
    this.forget();
    void this.router.navigate(accessKeyLink);
  }

  /** O gateway respondeu 401 com a chave guardada (trocada ou removida no backend). */
  expire(): void {
    if (!this.hasKey()) {
      return;
    }
    this.forget();
    this.notice.set('A chave deixou de valer. Cole a chave do painel de novo.');
    void this.router.navigate(accessKeyLink);
  }

  private forget(): void {
    this.stored.set(null);
    clearStorage();
  }
}

function readStored(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function clearStorage(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sem storage: não há o que apagar.
  }
}
