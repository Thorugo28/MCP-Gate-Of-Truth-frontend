/** Chave do upstream de uma tool exposta (`<chave>__<original>`): o trecho antes do primeiro `__`. */
export function upstreamKeyOf(exposedName: string): string {
  const i = exposedName.indexOf('__');
  return i === -1 ? exposedName : exposedName.slice(0, i);
}
