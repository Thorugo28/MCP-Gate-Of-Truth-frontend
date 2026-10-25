/** Segmentos de rota de primeiro nível. Use em `routerLink` em vez de string solta. */
export const AppPaths = {
  upstreams: 'upstreams',
  playground: 'playground',
} as const;

/** Comandos de `routerLink` para o detalhe de um upstream. */
export function upstreamDetailsLink(key: string): string[] {
  return ['/', AppPaths.upstreams, key];
}

/** Comandos de `routerLink` para o playground; a tool vai em `queryParams: { tool }`. */
export const playgroundLink = ['/', AppPaths.playground];
