/** Segmentos de rota de primeiro nível. Use em `routerLink` em vez de string solta. */
export const AppPaths = {
  upstreams: 'upstreams',
  playground: 'playground',
  calls: 'chamadas',
  /** Gestão das chaves; não confundir com `accessKey` (a tela de entrar). */
  keys: 'chaves',
  accessKey: 'chave',
} as const;

/** Comandos de `routerLink` para o detalhe de um upstream. */
export function upstreamDetailsLink(key: string): string[] {
  return ['/', AppPaths.upstreams, key];
}

/** Comandos de `routerLink` para o playground; a tool vai em `queryParams: { tool }`. */
export const playgroundLink = ['/', AppPaths.playground];

/** Comandos de `routerLink` para a tela de chave de acesso. */
export const accessKeyLink = ['/', AppPaths.accessKey];
