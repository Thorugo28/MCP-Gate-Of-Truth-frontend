// CallToolResult do SDK MCP (spec 2025-11-25); o backend devolve direto, sem record próprio.

export type ToolArguments = Record<string, unknown>;

export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image' | 'audio'; data: string; mimeType: string }
  | { type: 'resource_link'; uri: string; name?: string; mimeType?: string }
  | {
      type: 'resource';
      resource: { uri: string; mimeType?: string; text?: string; blob?: string };
    };

export interface CallToolResultDto {
  content: ContentBlock[];
  /** Ausente equivale a `false`. */
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
}
