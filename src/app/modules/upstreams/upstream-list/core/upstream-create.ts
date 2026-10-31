import { ENV_NAME_PATTERN, UPSTREAM_KEY_PATTERN } from '../../../shared/core/api/upstream.dto';
import { errorMessageOf, httpStatusOf, serverErrorOf } from '../../../shared/core/http/http-error';

/** Erro do formulário de novo upstream: no campo chave ou no topo do diálogo. 503 não aparece aqui (vira snackbar). */
export interface CreateUpstreamError {
  key: string | null;
  form: string | null;
}

/** Uma linha nome/valor do env, como digitada. */
export interface EnvEntry {
  name: string;
  value: string;
}

/** Nome de variável que costuma guardar segredo. */
const SECRET_NAME = /TOKEN|KEY|SECRET|PASSWORD/i;

/** Validação local com o mesmo padrão do backend; `null` se a chave vale. */
export function upstreamKeyError(key: string): string | null {
  if (key === '') {
    return 'Dê uma chave para o upstream.';
  }
  return UPSTREAM_KEY_PATTERN.test(key)
    ? null
    : 'Use letras, números e "-" (sem "_"), até 32 caracteres, começando por letra ou número.';
}

/** Um argumento por linha; linhas em branco não contam. Não separa por espaço: caminho com espaço quebraria. */
export function parseArgs(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

/** Linhas totalmente vazias são ignoradas. */
export function toEnv(entries: EnvEntry[]): Record<string, string> {
  return Object.fromEntries(
    entries
      .map((e) => ({ name: e.name.trim(), value: e.value }))
      .filter((e) => e.name !== '' || e.value !== '')
      .map((e) => [e.name, e.value]),
  );
}

/**
 * Erro de uma linha do env, ou `null`. O banco guarda o que for digitado, então segredo literal bloqueia o envio:
 * tem que ir como referência `${VARIAVEL}`, resolvida no gateway.
 */
export function envEntryError(entry: EnvEntry, entries: EnvEntry[]): string | null {
  const name = entry.name.trim();
  if (name === '' && entry.value === '') {
    return null;
  }
  if (!ENV_NAME_PATTERN.test(name)) {
    return 'Nome de variável: letras, números e "_", sem começar por número.';
  }
  if (entries.filter((e) => e.name.trim() === name).length > 1) {
    return 'Variável repetida.';
  }
  if (SECRET_NAME.test(name) && !entry.value.startsWith('${')) {
    return 'Segredo vai como ${VARIAVEL}, nunca o valor.';
  }
  return null;
}

export function createUpstreamErrorOf(error: unknown): CreateUpstreamError {
  switch (httpStatusOf(error)) {
    case 409:
      return { key: 'Chave já usada, no application.yml ou no painel.', form: null };
    case 400:
      return {
        key: null,
        form: serverErrorOf(error) ?? 'O gateway recusou o upstream: confira os campos.',
      };
    case 503:
      return { key: null, form: null };
    default:
      return { key: null, form: errorMessageOf(error) };
  }
}
