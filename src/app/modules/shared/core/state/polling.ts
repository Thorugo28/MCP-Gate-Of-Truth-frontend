import { DestroyRef, inject, Signal, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/** Intervalo do polling da lista de upstreams; acompanha o health check do backend (~10s). */
export const UPSTREAMS_POLL_INTERVAL_MS = 10_000;

/** Intervalo do polling das últimas chamadas. */
export const CALLS_POLL_INTERVAL_MS = 5_000;

/**
 * Chama `reload` a cada `intervalMs` enquanto o dono (componente ou store de página) existir.
 * Não empilha: pula o tique se `isLoading` ainda for `true`. Pausa com a aba em segundo plano
 * e recarrega na hora quando ela volta. Precisa de contexto de injeção.
 */
export function pollWhileVisible(
  reload: () => void,
  isLoading: Signal<boolean>,
  intervalMs: number,
): void {
  const document = inject(DOCUMENT);
  let timer: ReturnType<typeof setInterval> | undefined;

  const tick = () => {
    if (!isLoading()) {
      reload();
    }
  };
  const start = () => {
    timer ??= setInterval(tick, intervalMs);
  };
  const stop = () => {
    clearInterval(timer);
    timer = undefined;
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      tick();
      start();
    } else {
      stop();
    }
  };

  if (document.visibilityState === 'visible') {
    start();
  }
  document.addEventListener('visibilitychange', onVisibilityChange);
  inject(DestroyRef).onDestroy(() => {
    stop();
    document.removeEventListener('visibilitychange', onVisibilityChange);
  });
}

/** Hora atual (ms) atualizada a cada `intervalMs`, para contagens regressivas. Precisa de contexto de injeção. */
export function nowSignal(intervalMs = 1000): Signal<number> {
  const now = signal(Date.now());
  const timer = setInterval(() => now.set(Date.now()), intervalMs);
  inject(DestroyRef).onDestroy(() => clearInterval(timer));
  return now.asReadonly();
}
