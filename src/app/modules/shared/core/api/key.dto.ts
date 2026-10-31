// Espelha admin/KeyDto e admin/CreatedKeyDto (records) do backend.

/** `file`: do application.yml (só leitura); `panel`: criada pelo painel (pode ser revogada). */
export type KeyOrigin = 'file' | 'panel';

/** Em `upstreams`, vale para todos os upstreams. */
export const ALL_UPSTREAMS = '*';

/** Mesmo padrão do backend (`AccessKeys.NAME`). */
export const KEY_NAME_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/** Uma chave de acesso, nunca com o valor. */
export interface KeyDto {
  name: string;
  /** `["*"]` = todos; `[]` = nenhum. */
  upstreams: string[];
  admin: boolean;
  origin: KeyOrigin;
  /** ISO-8601 UTC. Datas e autores só nas do painel (`null` nas do yml). */
  createdAt: string | null;
  /** Nome da chave que criou. */
  createdBy: string | null;
  /** `null` = ativa. */
  revokedAt: string | null;
  revokedBy: string | null;
}

/** Resposta de `POST /admin/keys`: o valor só aparece aqui, uma vez. */
export interface CreatedKeyDto {
  key: KeyDto;
  value: string;
}

/** Corpo de `POST /admin/keys`. */
export interface CreateKeyRequest {
  name: string;
  upstreams: string[];
  admin: boolean;
}
