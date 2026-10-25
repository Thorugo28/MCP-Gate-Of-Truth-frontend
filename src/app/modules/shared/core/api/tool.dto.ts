// Espelha admin/ToolDto (record) do backend.

/** JSON Schema cru; tipar mais só se o formulário dinâmico vier. */
export type JsonSchema = Record<string, unknown>;

export interface ToolDto {
  /** Nome exposto, com prefixo `<chave>__`. */
  name: string;
  originalName: string;
  description: string | null;
  inputSchema: JsonSchema;
}
