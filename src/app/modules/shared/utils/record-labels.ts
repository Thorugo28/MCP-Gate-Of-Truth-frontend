/** Rótulos de quem e quando criou um registro (chave, upstream) e de onde ele vem. */

const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

/** `"26/10"` no fuso do navegador. */
export function dateLabel(iso: string): string {
  return dateFormat.format(new Date(iso));
}

/** `file`: do application.yml; `panel`: criado pelo painel. */
export function originLabel(origin: 'file' | 'panel'): string {
  return origin === 'file' ? 'Arquivo' : 'Painel';
}

/** `"26/10 por painel"`; só a data se o autor não vier. */
export function byLabel(iso: string, by: string | null): string {
  return by ? `${dateLabel(iso)} por ${by}` : dateLabel(iso);
}
