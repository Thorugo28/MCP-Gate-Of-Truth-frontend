// Espelha admin/CallDto (record) do backend.
export type CallOutcome = 'OK' | 'TOOL_ERROR' | 'TIMEOUT' | 'UNAVAILABLE' | 'FAILURE';

/** `mcp`: chamada pelo /mcp (Claude Code etc.); `admin`: pelo playground do painel. */
export type CallVia = 'mcp' | 'admin';

export interface CallDto {
  /** ISO-8601 UTC do início da chamada. */
  at: string;
  /** Nome da chave que chamou (nunca o valor). */
  caller: string;
  via: CallVia;
  /** Nome exposto da tool (`<upstream>__<original>`). */
  tool: string;
  /** `null` se a rota já tinha saído do gateway. */
  upstream: string | null;
  durationMs: number;
  outcome: CallOutcome;
  /** Mensagem do gateway, só em TIMEOUT, UNAVAILABLE e FAILURE. */
  error: string | null;
}

/** Filtros de `GET /admin/calls`. Igualdade exata; vazio não filtra. */
export interface CallQuery {
  limit?: number;
  caller?: string;
  tool?: string;
  outcome?: CallOutcome | null;
}
