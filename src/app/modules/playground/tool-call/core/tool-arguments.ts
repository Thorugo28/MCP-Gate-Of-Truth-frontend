import { JsonSchema } from '../../../shared/core/api/tool.dto';
import { ToolArguments } from '../../../shared/core/api/tool-call.dto';

const EMPTY_BY_TYPE: Record<string, unknown> = {
  string: '',
  number: 0,
  integer: 0,
  boolean: false,
  array: [],
  object: {},
};

/**
 * Esqueleto de argumentos a partir do inputSchema: só as propriedades obrigatórias, com valor vazio do tipo.
 * Schema que não dá para ler vira `{}`.
 */
export function argumentsTemplate(schema: JsonSchema): ToolArguments {
  const properties = (schema['properties'] ?? {}) as Record<string, { type?: unknown }>;
  const required = Array.isArray(schema['required']) ? (schema['required'] as string[]) : [];
  return Object.fromEntries(
    required.map((name) => {
      const type = properties[name]?.type;
      return [name, typeof type === 'string' && type in EMPTY_BY_TYPE ? EMPTY_BY_TYPE[type] : null];
    }),
  );
}

export type ParsedArguments = { ok: true; value: ToolArguments } | { ok: false; error: string };

/** O backend espera um objeto JSON no corpo (sem envelope). */
export function parseArguments(text: string): ParsedArguments {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: `JSON inválido: ${(e as Error).message}` };
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'Os argumentos precisam ser um objeto JSON ({ ... }).' };
  }
  return { ok: true, value: value as ToolArguments };
}
