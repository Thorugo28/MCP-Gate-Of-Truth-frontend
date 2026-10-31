import { ALL_UPSTREAMS, KEY_NAME_PATTERN } from '../../../shared/core/api/key.dto';
import { errorMessageOf, httpStatusOf } from '../../../shared/core/http/http-error';

/** Erro do formulário de nova chave: no campo nome ou no formulário todo. 503 não aparece aqui (vira snackbar). */
export interface CreateKeyError {
  name: string | null;
  form: string | null;
}

/** Validação local com o mesmo padrão do backend; `null` se o nome vale. */
export function keyNameError(name: string): string | null {
  if (name === '') {
    return 'Dê um nome para a chave.';
  }
  return KEY_NAME_PATTERN.test(name)
    ? null
    : 'Use só letras, números, "_" e "-", até 64 caracteres.';
}

/**
 * "todos (*)" exclui os outros: escolher "*" deixa só ele; escolher outro upstream com "*" marcado tira o "*".
 * `previous` é a seleção antes da mudança, `next` a que o multi-select mandou.
 */
export function normalizeUpstreams(previous: string[], next: string[]): string[] {
  const hadAll = previous.includes(ALL_UPSTREAMS);
  const hasAll = next.includes(ALL_UPSTREAMS);
  if (hasAll && !hadAll) {
    return [ALL_UPSTREAMS];
  }
  if (hasAll && next.length > 1) {
    return next.filter((u) => u !== ALL_UPSTREAMS);
  }
  return next;
}

export function createKeyErrorOf(error: unknown): CreateKeyError {
  switch (httpStatusOf(error)) {
    case 409:
      return { name: 'Nome já usado, inclusive por chave revogada.', form: null };
    case 400:
      return {
        name: null,
        form: 'O gateway recusou a chave: confira o nome e se os upstreams ainda existem.',
      };
    case 503:
      return { name: null, form: null };
    default:
      return { name: null, form: errorMessageOf(error) };
  }
}

/** Comando para registrar o gateway no Claude Code com a chave nova. */
export function mcpAddCommand(mcpUrl: string, name: string, value: string): string {
  return `claude mcp add --transport http ${name} ${mcpUrl} --header "Authorization: Bearer ${value}"`;
}
