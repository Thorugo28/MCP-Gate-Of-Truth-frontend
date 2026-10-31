import { UpstreamDto } from '../core/api/upstream.dto';

/** `"<nome> <versão>"` anunciado pelo servidor, ou `"—"` quando DOWN (o backend manda `null`). */
export function serverLabel(dto: Pick<UpstreamDto, 'serverName' | 'serverVersion'>): string {
  const parts = [dto.serverName, dto.serverVersion].filter((p): p is string => !!p);
  return parts.length > 0 ? parts.join(' ') : '—';
}

/**
 * `"tentativa N · próxima em 42s"` de um upstream DOWN, contando a partir de `now` (ms).
 * `null` quando UP (sem `attempts`/`nextRetryAt`).
 */
export function retryLabel(
  dto: Pick<UpstreamDto, 'attempts' | 'nextRetryAt'>,
  now: number,
): string | null {
  if (dto.attempts === null || dto.nextRetryAt === null) {
    return null;
  }
  const seconds = Math.ceil((Date.parse(dto.nextRetryAt) - now) / 1000);
  const next = seconds > 0 ? `próxima em ${formatSeconds(seconds)}` : 'reconectando…';
  return `tentativa ${dto.attempts} · ${next}`;
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}min` : `${m}min ${s}s`;
}
