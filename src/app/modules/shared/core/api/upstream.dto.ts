// Espelha admin/UpstreamDto (record) do backend.
export type UpstreamStatus = 'UP' | 'DOWN';

/** `file`: do application.yml (só leitura); `panel`: cadastrado pelo painel (pode ser removido). */
export type UpstreamOrigin = 'file' | 'panel';

/**
 * OAuth dos upstreams HTTP (Notion remoto). `NEEDED`: DOWN esperando alguém autorizar pelo painel (sem próxima
 * tentativa); `OK`: o gateway tem token. Upstream sem OAuth vem `null`.
 */
export type UpstreamAuthorization = 'OK' | 'NEEDED';

/** Mesmo padrão do backend (`UpstreamCatalog.KEY`): sem "_", que separa a chave do nome da tool. */
export const UPSTREAM_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9-]{0,31}$/;

/** Mesmo padrão do backend para nome de variável em `env`. */
export const ENV_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export interface UpstreamDto {
  key: string;
  /** `null` quando DOWN. */
  serverName: string | null;
  /** `null` quando DOWN. */
  serverVersion: string | null;
  status: UpstreamStatus;
  /** Só as tools ligadas; `0` quando DOWN. */
  toolCount: number;
  /** Tentativas de reconexão; `0` (ou `null`) quando UP. `0` em DOWN é o upstream recém-cadastrado. */
  attempts: number | null;
  /** ISO-8601 UTC da próxima tentativa; `null` quando UP. */
  nextRetryAt: string | null;
  origin: UpstreamOrigin;
  /** Só nos do painel, como cadastrado (pode ser `${NPX_CMD}`); `null` nos do yml. */
  command: string | null;
  args: string[] | null;
  /** Valores como cadastrados (`${VAR}`), nunca o segredo resolvido. */
  env: Record<string, string> | null;
  /** ISO-8601 UTC. */
  createdAt: string | null;
  /** Nome da chave que cadastrou. */
  createdBy: string | null;
  authorization: UpstreamAuthorization | null;
}

/** Resposta de `POST /admin/upstreams/{key}/authorize`: o link do login, que vale 10 min e uma vez só. */
export interface AuthorizeResponse {
  authorizationUrl: string;
}

/** Corpo de `POST /admin/upstreams`. */
export interface CreateUpstreamRequest {
  key: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}
