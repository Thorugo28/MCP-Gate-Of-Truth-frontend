import { CallOutcome, CallVia } from '../../../shared/core/api/call.dto';

const timeFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** `"26/10, 22:15:03"` no fuso do navegador. */
export function timeLabel(iso: string): string {
  return timeFormat.format(new Date(iso));
}

/** `"12 ms"` abaixo de 1s; `"5,0 s"` a partir dele. */
export function durationLabel(ms: number): string {
  if (ms < 1000) {
    return `${ms} ms`;
  }
  return `${(ms / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} s`;
}

export function viaLabel(via: CallVia): string {
  return via === 'mcp' ? 'MCP' : 'Playground';
}

/** Descrição curta de cada resultado, na ordem em que aparecem no filtro. */
export const OUTCOME_DESCRIPTIONS: Record<CallOutcome, string> = {
  OK: 'deu certo',
  TOOL_ERROR: 'a tool respondeu com erro',
  TIMEOUT: 'o upstream não respondeu a tempo',
  UNAVAILABLE: 'upstream fora do ar',
  FAILURE: 'falha no gateway',
};
