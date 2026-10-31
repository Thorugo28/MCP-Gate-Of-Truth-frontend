# MCP Gate of Truth: painel admin (frontend)

Painel web para operar o gateway MCP Gate of Truth, no estilo do painel do Bifrost.
- Projeto Angular separado do backend. Consome só a API REST `/admin` do gateway (Spring), nunca o `/mcp`.
- O backend tem o próprio CLAUDE.md. Este arquivo trata só do frontend; nada daqui vai para lá.
- Glossário mínimo: **upstream** é um servidor MCP de fora que o gateway conecta (ex.: `notion`, `filesystem`).
  **Chave** é o nome do upstream no application.yml do gateway. **Nome exposto** de uma tool é `<chave>__<nome original>`
  (ex.: `notion__API-post-page`).

## Escopo
**Etapa A (agora): só leitura, atrás da chave de acesso (fase 4).**
- Lista de upstreams com status (`UP`/`DOWN`, nome e versão que o servidor anuncia, quantidade de tools).
- Detalhe de um upstream com as tools dele (nome exposto, nome original, descrição, inputSchema).
- Playground: escolher uma tool, preencher os argumentos em JSON, chamar e ver o resultado cru.
- Tela de chave de acesso (`/chave`) e botão "Sair".
- Registros do alquimista (`/chamadas`): últimas chamadas de tool, só leitura (fase 5 do backend).

**Etapa B (concluída em 2026-10-31): edição.** Ligar e desligar tools, cadastrar upstreams, API keys,
histórico de chamadas que sobrevive ao reinício (com o banco). O front acompanha o backend um passo por vez (seção "Etapa B"):
só entra o que o back já expõe, sem botões desabilitados "para depois", sem telas vazias, sem serviços de escrita adiantados.

## Stack e decisões fixas (não mudar sem conversar)
- Angular na versão estável atual (confira com `ng version`), gerado pelo Angular CLI.
- Standalone components, sem NgModule. A pasta `modules/` é organização de código, não `@NgModule`.
- Estado com signals (`signal`, `computed`, `resource`/`httpResource` quando couber). RxJS só onde o `HttpClient` já entrega Observable
  ou para fluxo de eventos de verdade; sem NgRx.
- `HttpClient` com `provideHttpClient(withInterceptors(...))`. Sem bibliotecas de chamada HTTP extras.
- Controle de fluxo novo nos templates (`@if`, `@for`, `@switch`), não `*ngIf`/`*ngFor`.
- `ChangeDetectionStrategy.OnPush` em todos os componentes.
- Biblioteca de UI: Angular Material (+ CDK). É o que Victor já usa no trabalho e sabe corrigir; não trazer outra lib de
  componentes nem de CSS sem conversar. Em `shared/ui/` ficam só componentes nossos montados em cima do Material.
- Prefixo de seletor: `got` (Gate of Truth). Definido no `angular.json` (`"prefix": "got"`), então os seletores ficam
  `got-upstream-table`, `got-status-badge` etc. Diretivas usam `got` em camelCase (`gotAutofocus`).
- Testes: o runner padrão do CLI da versão usada. [A DEFINIR: nível de cobertura esperado.]
- Autenticação: API key do backend (fase 4), enviada como `Authorization: Bearer <chave>`. Ver "Fase 4: chave de acesso".

## Visual (decidido em 2026-10-25)
Tema: o Portão da Verdade de Fullmetal Alchemist. Sóbrio por padrão; o tema aparece no logo, nos títulos e no texto,
não em efeitos. Se uma ideia visual brigar com o Material, vence o Material.

### Cores (tokens em `src/styles/_tokens.scss`, como variáveis CSS `--got-*`)
| Token | Claro ("A Verdade") | Escuro ("Alquimia sombria") |
|---|---|---|
| fundo | `#F8F9FA` (off-white) | `#0D0D0D` |
| superfície (cards, tabelas) | `#FFFFFF` | `#1A1A1A` |
| texto | `#1A1A1A` (chumbo) | `#E6E6E6` |
| borda | `#D0D3D6` | `#C0C0C0` (prata) |
| acento (preenchimento) | `#D4AF37` com texto `#1A1A1A` | `#38B6FF` com texto `#0D0D0D` |
| acento (texto e links) | `#7A5C0F` | `#38B6FF` |
| UP | `#1E7B34` | `#4ADE80` |
| DOWN e erro | `#B3261E` | `#F87171` |
- Nada de preto ou branco absolutos no modo claro. Nada de cor solta em componente: só `var(--got-*)` ou o tema do Material.
- Dourado `#D4AF37` nunca como cor de texto sobre fundo claro (contraste 2:1). Status nunca em dourado ou azul de acento.
- Tema do Material gerado com `ng generate @angular/material:theme-color` a partir do acento; os tokens acima ajustam o resto.
- Modo: segue o sistema (`prefers-color-scheme`) e tem um botão na toolbar que força claro/escuro (salvo em `localStorage`).

### Tipografia
- Cinzel: só no logo e nos títulos de página (`h1`/`h2`). Nunca em tabela, formulário ou botão.
- Inter: todo o resto.
- JetBrains Mono: JSON, inputSchema, resultado de tool e nomes de tool/chave (`notion__API-post-page`).
- Fontes instaladas por npm (`@fontsource/*`), não por link externo.

### Espaçamento
- Todo padding, margin e gap é múltiplo de 4. Escala: 4, 8, 12, 16, 24, 32, 48 (`--got-space-1` … `--got-space-12`, valor = n × 4px).
- Nada colado: mínimo de 16 dentro de card, painel e célula de cabeçalho; 24 entre cards e seções; 32 nas bordas da página
  (16 em tela estreita). 8 entre elementos inline (ícone e texto, botões lado a lado).
- Densidade do Material no padrão (0), não compacta.
- Sem `px` solto nos componentes: só os tokens.

### Layout e componentes
- Sidenav fixa (Upstreams, Playground, Chamadas, Chaves) + toolbar com logo, nome e botão de modo. Conteúdo com largura máxima de 1200px.
- Listas: `mat-table`. Status: `mat-chip` com a cor semântica. inputSchema: `mat-expansion-panel` fechado por padrão.
- Bordas finas (1px, `--got-border`) e raio do Material. Sem sombras fortes, sem cantos chanfrados, sem brilho nas bordas.
- Uma animação só: o círculo de transmutação girando nos loadings (principalmente o `GET /admin/upstreams`, que pode demorar).
  Respeitar `prefers-reduced-motion`.
- Logo: silhueta simples do portão, em SVG de uma cor (herda `currentColor`).

### Textos temáticos
O termo técnico continua visível; o temático vem junto, não no lugar.
- UP → "Portão aberto · UP"; DOWN → "Portão fechado · DOWN".
- Botão de chamar tool → "Executar transmutação".
- Log de chamadas → "Registros do alquimista" (título da página; no menu, "Chamadas").
- Mensagens de erro em linguagem direta (sem tema): o que falhou e o que fazer.

## Ambiente
- Linux Mint, Node via nvm (v24.21.0 no notebook). Sem Docker.
- Gateway rodando em `http://localhost:8080` (`./mvnw spring-boot:run` no projeto do backend).
- Subir o painel: `npm start` (ou `ng serve`), em `http://localhost:4200`.
- O painel chama o gateway direto (sem proxy do `ng serve`). O backend já libera CORS em `/admin/**` para
  `http://localhost:4200` (propriedade `gate.admin.cors-origins`); se mudar a porta do front, mudar lá também.
- A URL base da API (`http://localhost:8080`) vem de um único lugar: `src/environments/environment.ts` (`ng generate environments`),
  lido por um `InjectionToken` (`API_BASE_URL`) em `shared/core/api`. Nenhum outro arquivo escreve a URL.

## Arquitetura: módulos por domínio, pastas por domínio/ação
Todo o código fica em `src/app/modules/`. Um módulo `shared/` transversal e um módulo por feature.
Não existem pastas `core/`, `features/` ou `shared/` soltas na raiz de `app/`.

```
src/app/
├── app.config.ts            providers globais (http, interceptors, router)
├── app.routes.ts            só aponta para as rotas de cada feature (lazy)
├── app.ts                   shell: layout e <router-outlet>
└── modules/
    ├── shared/
    │   ├── core/
    │   │   ├── api/         cliente da API /admin (um service por recurso) e DTOs da resposta
    │   │   ├── http/        interceptors (erro, logging em dev), tratamento de erro HTTP
    │   │   ├── state/       utilitários de estado com signals (ex.: estado de carregamento/erro)
    │   │   └── routes/      constantes e helpers de rota
    │   ├── identity/        chave de acesso: service, interceptor, guard e a tela key-entry/ (core/ + ui/)
    │   ├── ui/              componentes visuais genéricos (tabela, badge de status, bloco de JSON, loading, erro)
    │   ├── services/        serviços transversais sem regra de domínio (ex.: notificação)
    │   ├── types/           tipos compartilhados
    │   └── utils/           funções puras
    ├── upstreams/
    │   ├── upstreams.routes.ts
    │   ├── upstream-list/
    │   │   ├── core/        orquestração e estado (ex.: upstream-list.store.ts)
    │   │   └── ui/          apresentação (página + componentes)
    │   └── upstream-details/
    │       ├── core/
    │       └── ui/
    ├── playground/
    │   ├── playground.routes.ts
    │   └── tool-call/
    │       ├── core/
    │       └── ui/
    ├── calls/
    │   ├── calls.routes.ts
    │   └── call-list/
    │       ├── core/
    │       └── ui/
    └── keys/
        ├── keys.routes.ts
        └── key-list/          lista + diálogos de criar e revogar
            ├── core/
            └── ui/
```
Nomes de feature e ação são sugestão; ajuste, mas mantenha o padrão `<domínio>-<ação>`.

### Regras de dependência
- `core/` nunca importa de `ui/`. `ui/` pode importar do `core/` do mesmo caso de uso.
- Um caso de uso não importa de outro caso de uso. O que precisar ser reaproveitado sobe para `shared/`.
- Uma feature não importa de outra feature. Ligação entre features é só por rota (ex.: o detalhe do upstream leva ao
  playground com `?tool=<nome exposto>`).
- `shared/` nunca importa de features.
- Só `shared/core/api` fala com o `HttpClient` para a API `/admin`. Os `core/` das features usam esses services.

### O que vai em cada camada
- `core/`: store do caso de uso (signals de dados, carregamento e erro), chamadas aos services de `shared/core/api`,
  transformação de DTO para o que a tela precisa, validações (ex.: JSON de argumentos válido). Sem nada de template ou DOM.
- `ui/`: a página roteada (injeta o store do `core/`, repassa dados) e componentes de apresentação (só `input()`/`output()`,
  sem injetar store nem service). Sem regra de negócio no template.
- Store por caso de uso fica `providedIn` no componente de página (ou nas rotas da feature), não `root`, para morrer junto com a tela.

### Nomes de arquivo
- `<ação>.store.ts`, `<ação>.page.ts`, `<nome>.component.ts`, `<recurso>.api.ts`, `<recurso>.dto.ts`.
- O tipo vai no sufixo do arquivo (`.store`, `.page`, `.api`, `.dto`); o projeto vai no prefixo do seletor (`got-`), nunca no nome do arquivo.

## identity/
Desde a fase 4: `access-key.service.ts` (a chave guardada), `access-key.interceptor.ts` (anexa a chave, trata 401),
`access-key.guard.ts` (rotas) e a tela `key-entry/` (`core/` + `ui/`, mesmo padrão dos casos de uso das features).
O teste da chave usa `shared/core/api/access-key.api.ts`. Detalhes em "Fase 4: chave de acesso".

## Contrato da API /admin (o que o backend expõe hoje)
Fonte da verdade: o CLAUDE.md do backend, seção "API /admin". Se divergir, vale o backend; atualizar aqui e nos DTOs.

```
Todo /admin/** exige  Authorization: Bearer <chave com admin: true>
     sem chave ou chave errada → 401 (WWW-Authenticate: Bearer, sem corpo); chave sem admin → 403 (sem corpo)
     preflight OPTIONS passa sem chave; o CORS libera Authorization e Content-Type
GET  /admin/upstreams
     → [{ key, serverName, serverVersion, status: "UP" | "DOWN", toolCount, attempts, nextRetryAt }]
       (DOWN: serverName/serverVersion null, toolCount 0, attempts = tentativas de reconexão, nextRetryAt ISO-8601 UTC;
        UP: attempts 0 (o record é int) e nextRetryAt null)
       desde o passo 4 da etapa B, cada item também traz origin ("file" | "panel") e, só nos do painel, command, args,
       env (como cadastrados, com as referências ${VAR} sem resolver), createdAt e createdBy; nos do yml esses vêm null
GET  /admin/upstreams/allowed-commands
     → string[] dos comandos permitidos, já resolvidos (ex.: "/usr/bin/npx"); o cadastro aceita a referência (${NPX_CMD})
POST /admin/upstreams
     body: {"key": "docs", "command": "${NPX_CMD}", "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/..."],
            "env": {"PATH": "${NODE_BIN}:/usr/bin"}}
       (key [A-Za-z0-9][A-Za-z0-9-]{0,31}, sem "_"; nome de env [A-Za-z_][A-Za-z0-9_]*; command resolvido tem que estar na lista)
     → 201 com o UpstreamDto em DOWN; ele conecta na próxima rodada do health check (segundos) e vira UP no GET
       entrada inválida, comando fora da lista ou referência que não resolve → 400 {"error": "..."}; chave usada → 409 (sem corpo)
POST /admin/upstreams/{key}/authorize          (Notion remoto: só upstreams HTTP com OAuth)
     → 200 {"authorizationUrl": "https://mcp.notion.com/authorize?..."}   vale 10 min, uma vez só
       desconhecido 404; STDIO 400 {"error"}; descoberta ou registro no servidor de autorização falhou 502 {"error"}; banco fora 503
     O login acontece no navegador, fora do painel; a volta cai no GET /oauth/callback do gateway (página própria do back).
DELETE /admin/upstreams/{key}
     → 204; do yml → 409; desconhecido → 404. As tools somem na hora; chaves que citam o upstream continuam citando.
     toolCount conta só as tools ligadas (o que está no /mcp), desde o passo 2 da etapa B.
GET  /admin/upstreams/{key}/tools
     → [{ name, originalName, description, inputSchema, enabled }]   (ordenado por name; key desconhecida → 404;
       as desligadas também vêm, com enabled: false)
GET  /admin/calls?limit=50&caller=&tool=&outcome=
     → [{ at, caller, via: "mcp" | "admin", tool, upstream, durationMs, outcome, error }]   (mais recentes primeiro)
       limit padrão 50, acima do buffer (500) vale o buffer, < 1 → 400; filtros por igualdade exata, vazio não filtra;
       outcome inválido → 400. Desde a etapa B fica no banco: sobrevive ao reinício (teto do limit fixo em 500).
       Argumentos nunca vêm.
POST /admin/tools/{name}/call
     body: o objeto de arguments direto, ex.: {} ou {"path": "..."}  (sem envelope { arguments })
     → CallToolResult do MCP: { content: [{ type, ... }], isError?, structuredContent? }
       (name desconhecido ou tool desligada → 404)
PUT  /admin/tools/{name}/enabled
     body: {"enabled": false}  ou  {"enabled": true}
     → o ToolDto atualizado   (name desconhecido → 404; sem enabled ou JSON inválido → 400; repetir o estado → 200, nada muda)
GET  /admin/keys
     → [KeyDto] todas, revogadas inclusive, ordenadas por nome; nunca o valor
POST /admin/keys
     body: {"name": "teste", "upstreams": ["filesystem"], "admin": false}
       (sem upstreams = não vê nenhum; ["*"] = todos; sem admin = false; name [A-Za-z0-9_-]{1,64})
     → 201 { key: KeyDto, value: "<64 hex>" }   o valor só aparece aqui, uma vez
       nome inválido ou upstream desconhecido → 400; nome já usado (yml, banco ou revogada) → 409
DELETE /admin/keys/{name}
     → 204 (também se já estava revogada); chave do yml → 409; desconhecida → 404
     Efeito na hora: a chave passa a dar 401, inclusive nas sessões abertas. Revogar a chave do próprio painel derruba o painel.
Banco fora do ar (etapa B): GET /admin/calls e as escritas (PUT) → 503 sem corpo, em até ~5s; nada muda no gateway.
```
- `name` é sempre o nome exposto (`<chave>__<original>`). A chave do upstream de uma tool é o trecho antes do primeiro `__`
  (helper em `shared/utils`), já que o `ToolDto` não traz a chave.
- Não existe endpoint de um upstream só nem de todas as tools:
  - Detalhe do upstream: cabeçalho a partir do item de `GET /admin/upstreams`, tools de `/admin/upstreams/{key}/tools`.
  - Seletor do playground: primeiro escolhe o upstream, depois a tool dele (os mesmos dois endpoints). Com `?tool=<nome>`
    na URL, já vem tudo selecionado.
- `isError` pode não vir no JSON: ausente é `false`. `structuredContent` é opcional; mostrar só se vier.
- `GET /admin/upstreams` lê o status guardado pelo health check do backend (fase 3) e responde em milissegundos.
  O status muda sozinho (queda a cada ~10s de checagem, reconexão com backoff de 15s até 5min), então a lista se atualiza
  por polling (ver "Ajustes da fase 3"). O botão "atualizar" continua.
- Erro de tool (`isError: true`) é resposta 200 e resultado normal: o playground mostra, não trata como falha HTTP.
- 404 vira mensagem própria na tela ("upstream não encontrado", "tool não encontrada"); outros erros HTTP (inclusive
  gateway desligado, status 0) caem no interceptor de `shared/core/http` e viram estado de erro.
- O playground chama tools de verdade (cria página no Notion, escreve arquivo). Mostrar isso na tela, sem esconder.

### Tipos (espelham os records do backend; ficam em `shared/core/api/*.dto.ts`)
```ts
// upstream.dto.ts  ←  admin/UpstreamDto (record)
export type UpstreamStatus = 'UP' | 'DOWN';
export interface UpstreamDto {
  key: string;
  serverName: string | null;     // null quando DOWN
  serverVersion: string | null;  // null quando DOWN
  status: UpstreamStatus;
  toolCount: number;             // 0 quando DOWN
  attempts: number | null;       // tentativas de reconexão; null quando UP
  nextRetryAt: string | null;    // ISO-8601 UTC da próxima tentativa; null quando UP
  // etapa B, passo 4
  origin: 'file' | 'panel';
  command: string | null;        // só nos do painel, como cadastrado (pode ser ${NPX_CMD})
  args: string[] | null;
  env: Record<string, string> | null;   // valores como cadastrados: ${VAR}, nunca o segredo
  createdAt: string | null;
  createdBy: string | null;
  // Notion remoto, passo 3
  authorization: 'OK' | 'NEEDED' | null;   // null = upstream sem OAuth; NEEDED = DOWN esperando login (nextRetryAt null)
}
export interface AuthorizeResponse { authorizationUrl: string; }
export interface CreateUpstreamRequest {
  key: string;
  command: string;
  args: string[];
  env: Record<string, string>;
}

// tool.dto.ts  ←  admin/ToolDto (record)
export type JsonSchema = Record<string, unknown>;   // JSON Schema cru; tipar mais só se o formulário dinâmico vier
export interface ToolDto {
  name: string;           // nome exposto, com prefixo
  originalName: string;
  description: string | null;
  inputSchema: JsonSchema;
  enabled: boolean;       // false = desligada pelo painel: fora do /mcp e do playground (etapa B, passo 2)
}

// tool-call.dto.ts  ←  CallToolResult do SDK MCP (o back devolve direto, sem record próprio)
export type ToolArguments = Record<string, unknown>;
export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image' | 'audio'; data: string; mimeType: string }
  | { type: 'resource_link'; uri: string; name?: string; mimeType?: string }
  | { type: 'resource'; resource: { uri: string; mimeType?: string; text?: string; blob?: string } };
export interface CallToolResultDto {
  content: ContentBlock[];
  isError?: boolean;
  structuredContent?: Record<string, unknown>;
}

// call.dto.ts  ←  admin/CallDto (record)
export type CallOutcome = 'OK' | 'TOOL_ERROR' | 'TIMEOUT' | 'UNAVAILABLE' | 'FAILURE';
export type CallVia = 'mcp' | 'admin';   // admin = playground do painel
export interface CallDto {
  at: string;               // ISO-8601 UTC
  caller: string;           // nome da chave, nunca o valor
  via: CallVia;
  tool: string;             // nome exposto
  upstream: string | null;  // null se a rota já tinha saído
  durationMs: number;
  outcome: CallOutcome;
  error: string | null;     // só em TIMEOUT, UNAVAILABLE e FAILURE (TOOL_ERROR vem null)
}

// key.dto.ts  ←  admin/KeyDto e admin/CreatedKeyDto (records). Conferir os nomes dos campos no record antes de escrever.
export type KeyOrigin = 'file' | 'panel';
export interface KeyDto {
  name: string;
  origin: KeyOrigin;
  upstreams: string[];          // ["*"] = todos; [] = nenhum
  admin: boolean;
  createdAt: string | null;     // ISO-8601 UTC; datas e autores só nas do painel (null nas do yml)
  createdBy: string | null;     // nome da chave que criou
  revokedAt: string | null;     // null = ativa
  revokedBy: string | null;
}
export interface CreatedKeyDto { key: KeyDto; value: string; }
```
- Os DTOs são o formato do fio e só aparecem em `shared/core/api` e nos `core/`. Se a tela precisar de outro formato
  (ex.: `isError` sempre booleano), o `core/` converte para um tipo de tela; o `ui/` não recebe DTO cru quando houver conversão.
- `ContentBlock` segue a spec MCP 2025-11-25. Tipo desconhecido que chegar: mostrar o JSON cru, não quebrar.
- Mudou um record no back: atualizar o `.dto.ts` correspondente no mesmo dia. Sem geração automática (OpenAPI) por enquanto.

## Plano da etapa A
Cada passo termina com algo visível no navegador.

1. Projeto criado, `environment.ts` com a URL base e o `API_BASE_URL`, shell com layout (Material) e as rotas lazy das features.
   Pronto quando: `npm start` abre o shell e navegar entre `/upstreams` e `/playground` funciona (telas vazias).
2. `shared/core/api` com os DTOs e os services, contra o backend real (sem mock).
   Pronto quando: a lista de upstreams mostra `notion` e `filesystem` com `UP` e 24/14 tools, sem erro de CORS no console
   (isso também fecha o passo 4 do `/admin` no backend).
3. `upstream-details`: tools de um upstream, com descrição e inputSchema formatado.
   Pronto quando: clicar em `filesystem` mostra as 14 tools com prefixo `filesystem__`, e `/upstreams/xpto` mostra "não encontrado".
4. `playground/tool-call`: seletor de tool, editor de argumentos em JSON (pré-preenchido a partir do inputSchema, se der),
   botão chamar, resultado cru.
   Pronto quando: chamar `filesystem__list_allowed_directories` pelo painel mostra a pasta sandbox.
5. Estados de carregamento e erro em todas as telas, inclusive gateway desligado.

Fica fora da etapa A: qualquer escrita além da chamada de tool, formulário gerado a partir do inputSchema
(o JSON cru basta). Polling da lista de upstreams entrou com os ajustes da fase 3; SSE continua fora.

## Concluído: ajustes da fase 3 (2026-10-26)
O backend agora derruba e reconecta upstreams sozinho. O painel precisa refletir isso.
1. `UpstreamDto` com `serverName`/`serverVersion` anuláveis e os campos novos `attempts` e `nextRetryAt` (ver Tipos).
   Pronto quando: compila sem `!` nem cast para esconder o `null`.
2. Upstream DOWN sem "null null": coluna Servidor mostra "—"; ao lado do status, "tentativa N · próxima em 42s"
   (contagem regressiva a partir de `nextRetryAt`, calculada no `core/`, não no template).
   Pronto quando: com o Notion morto (`pkill -f notion-mcp-server`), a linha mostra "—" e a contagem regressiva.
3. Polling da lista de upstreams a cada 10s enquanto a tela estiver aberta (parar ao sair; não empilhar requisições;
   pausar com a aba em segundo plano, `document.visibilityState`). Intervalo numa constante só.
   Pronto quando: matar o Notion faz a linha virar DOWN sem clicar em atualizar, e ela volta a UP sozinha depois.
4. Detalhe de upstream DOWN: `/admin/upstreams/{key}/tools` devolve `[]`; mostrar "Upstream fora do ar; as tools voltam quando
   ele reconectar", não "nenhuma tool".
5. Playground com tool de upstream que caiu: a chamada dá 404 (a rota sai do gateway). Mensagem: "tool indisponível: o upstream
   <chave> está fora do ar", em vez de "tool não encontrada". Timeout vem como `isError: true` com o texto do backend
   ("Upstream 'notion' não respondeu em 60s"): mostrar como resultado normal.

## Fase 4: chave de acesso (front feito em 2026-10-26; backend concluiu o passo 4 no mesmo dia)
O backend exige `Authorization: Bearer <chave>` em todo `/admin/**` (ver o contrato). O painel usa uma chave com
`admin: true` (no backend, `GATE_KEY_PANEL`); a do CLI (`GATE_KEY_CLI`) dá 403. Não tem login com usuário e senha:
a pessoa cola a chave uma vez.

1. ✅ Tela de chave (`shared/identity/key-entry/`, rota `/chave`): campo `type="password"`, "Lembrar neste navegador" e "Entrar".
   Ao entrar, testa a chave com `GET /admin/upstreams` (`AccessKeyApi.verify`, manda o header ele mesmo); 200 guarda e vai para
   `/upstreams`, 401 → "Chave inválida…", 403 → "Esta chave não tem acesso ao painel…", e não guarda.
   Pronto quando: colar a chave do painel leva para a lista; colar a do CLI mostra "sem acesso ao painel".
2. ✅ `AccessKeyService`: `signal` persistido em `sessionStorage` (chave `got-access-key`); com "lembrar", em `localStorage`
   (salvar num apaga do outro). A chave nunca vai para log, URL nem mensagem de erro.
3. ✅ `accessKeyInterceptor` (antes do `apiErrorInterceptor` na lista) anexa o header só em URL que começa com `API_BASE_URL/`.
   Pedido que já traz `Authorization` (o teste da chave nova) passa sem mudança e sem o tratamento de 401.
   401 com a chave guardada: `expire()` apaga a chave e manda para `/chave` com aviso "A chave deixou de valer…" (uma vez só).
   Pronto quando: trocar o valor de `GATE_KEY_PANEL` no backend e reiniciar faz o painel voltar para a tela de chave.
4. ✅ `accessKeyGuard` (`canActivate`) nas rotas de `upstreams` e `playground`: sem chave guardada → `/chave`.
   A `/chave` não tem guard (dá para trocar de chave estando logado).
5. ✅ Toolbar: botão "Sair" (só com chave guardada) que apaga a chave e volta para `/chave`.
- Testes: `access-key.service`, `access-key.interceptor`, `access-key.guard`, `access-key.api` e `key-entry.store`.
- Falta conferir no navegador, contra o backend de verdade, os "Pronto quando" dos passos 1 e 3.

Cuidados:
- O polling da lista de upstreams para porque o 401 navega para `/chave` e a página (com o store e o polling) morre;
  o `expire()` só age se ainda houver chave, então 401s em sequência não empilham avisos nem navegações.
- Erro de CORS no console só depois de anexar a chave: o CORS do backend deixou de liberar `Authorization`.
- Cadastro e revogação de chaves pelo painel: etapa B, passo 3 (tela `/chaves`).

## Fase 5: registros do alquimista (front feito em 2026-10-26, depois do passo 4 do backend)
O backend guarda as últimas chamadas de tool em memória (`GET /admin/calls`, ver o contrato). O painel mostra, só leitura.
1. ✅ `CallDto` + `CallsApi.list(query)` em `shared/core/api` (filtro vazio não vai na URL).
2. ✅ Feature `calls/call-list`, rota `/chamadas` com `accessKeyGuard`, item "Chamadas" no menu (ícone `history`).
   Tabela: quando (dd/mm, hh:mm:ss no fuso do navegador), chave, por (MCP/Playground), tool, resultado (chip; verde só em OK)
   com a mensagem de `error` ao lado, duração ("12 ms", "5,0 s"). Pede as últimas `CALLS_LIMIT` (100).
3. ✅ Filtros chave, tool (texto exato, Enter/blur aplica) e resultado (select), mandados ao backend; clicar na chave ou na
   tool de uma linha filtra por ela; "Limpar filtros" só com filtro ativo. Vazio diferencia "sem chamadas" de "nada com esses filtros".
4. ✅ Polling a cada `CALLS_POLL_INTERVAL_MS` (5s) com o mesmo `pollWhileVisible` da lista de upstreams; botão "Atualizar".
- Testes: `calls.api`, `call-labels` e `call-list.store`.
- Falta conferir no navegador, contra o backend de verdade: uma chamada pelo Claude Code (`cli`) e uma pelo playground
  (`painel`) aparecem no topo em até 5s, com "MCP" e "Playground".

Cuidados:
- Sem argumentos na tela (o backend não manda) e sem o nome do cliente MCP (o backend deixou de fora).
- O 401 do polling cai no `accessKeyInterceptor` como nas outras telas.
- Fora daqui: histórico persistente, paginação além do buffer, métricas do `/actuator/metrics` (Prometheus/Grafana ficaram fora).

## Etapa B: edição (com banco)
O backend faz um passo por vez (CLAUDE.md do back, "Estado atual: etapa B"); o front entra depois de cada passo pronto.

### Passo 1 do back (histórico no banco): quase nada no front
1. ✅ `/chamadas`: tirar qualquer texto que diga que o histórico some ao reiniciar. `CALLS_LIMIT` (100) continua abaixo do teto (500).
2. ✅ 503 no polling de `/chamadas` (banco fora): estado de erro com a mensagem "O banco do gateway está fora do ar; as tools
   continuam funcionando, só o histórico não aparece." O polling segue e a tabela volta sozinha quando o banco voltar.

### Passo 2 do back (ligar e desligar tools): feito em 2026-10-28
1. ✅ `ToolDto.enabled` (ver Tipos) e `ToolsApi.setEnabled(name, enabled)` em `shared/core/api`: `PUT /admin/tools/{name}/enabled`
   com `{ enabled }`, devolve o `ToolDto`. Nome com `encodeURIComponent`.
2. ✅ `upstream-details`: um `mat-slide-toggle` por tool ("Ligada"). Ao mudar:
   - o toggle daquela linha fica desabilitado com a requisição em voo (sem confirmação: é reversível);
   - sucesso: a linha troca pelo `ToolDto` devolvido e um snackbar curto ("write_file desligada" / "religada");
   - erro: o toggle volta ao estado anterior e o snackbar explica: 503 "banco fora do ar, nada mudou"; 404 "a tool saiu do
     upstream" e recarrega a lista. Esse erro fica na tela, não vira estado de erro da página (o interceptor deixa passar).
   - tool desligada: linha esmaecida e chip "Desligada"; continua expansível (descrição e inputSchema).
   - cabeçalho do detalhe: "14 tools, 1 desligada", contado da lista de tools (o `toolCount` do upstream conta só as ligadas).
3. ✅ Lista de upstreams: a coluna de tools passa a dizer "ligadas" (o `toolCount` já vem só com elas).
4. ✅ Playground: o seletor mostra só as tools ligadas. Com `?tool=<nome>` de uma tool desligada: aviso "Tool desligada no
   gateway" com link para o detalhe do upstream (onde se religa), sem botão de chamar. O 404 do `call` passa a dizer "tool não
   encontrada, desligada ou com o upstream fora".
5. ✅ `/chamadas` não muda: chamada que pegou a tool sendo desligada aparece como UNAVAILABLE com a mensagem do back.
- Testes: `tools.api` (método, URL e corpo do PUT), store do detalhe (sucesso troca a linha; 503 e 404 voltam o toggle;
  contagem de desligadas), filtro do playground.
- Pronto quando, no navegador contra o back de verdade (chave `painel`): desligar `filesystem__write_file` no detalhe do
  filesystem → o `/mcp` do Claude Code não mostra mais a tool e o playground não a oferece; recarregar a página (e reiniciar o
  gateway) mantém desligada; religar traz de volta nos dois. Com `docker compose stop`, desligar dá o snackbar de 503 e o
  toggle volta.

### Passo 3 do back (chaves pelo painel): feito em 2026-10-29
1. ✅ `KeyDto`/`CreatedKeyDto` (ver Tipos) e `KeysApi` em `shared/core/api`: `list()`, `create(req)`, `revoke(name)`.
2. ✅ Feature `keys/key-list`, rota `/chaves` com `accessKeyGuard`, item "Chaves" no menu (ícone `vpn_key`). Não confundir com
   `/chave` (a tela de entrar). Tabela: nome; origem (chip "Arquivo" ou "Painel"); upstreams (chips; `*` = "todos", vazio =
   "nenhum"); admin (ícone); criada (data e por quem, só nas do painel); situação ("Ativa" ou "Revogada em dd/mm por X").
   Revogadas escondidas por padrão, com um toggle "Mostrar revogadas". Sem polling: recarrega depois de criar ou revogar.
3. ✅ "Nova chave" abre um `MatDialog` (`disableClose`) em duas fases:
   - formulário: nome (validação local com o mesmo padrão do back), upstreams (multi-select com as chaves de
     `GET /admin/upstreams` mais a opção "todos (*)", que exclui as outras), "admin" (checkbox com o aviso "pode editar o
     gateway pelo painel"). 409 vira erro no campo nome ("nome já usado, inclusive por chave revogada"); 400 no formulário;
     503 snackbar.
   - depois do 201: o valor em fonte mono, botão de copiar (`Clipboard` do CDK), o comando pronto para copiar
     (`claude mcp add --transport http <nome> http://localhost:8080/mcp --header "Authorization: Bearer <valor>"`) e o aviso
     "este valor não aparece de novo". Fechar só pelo botão "Copiei, fechar".
   - **o valor nunca sai do diálogo:** não vai para store, signal global, storage, log nem URL; fechar o diálogo o descarta.
4. ✅ Revogar: botão só nas chaves do painel ativas (as do yml mostram um tooltip "definida no application.yml"). Diálogo de
   confirmação: "Quem usa a chave X perde o acesso na hora. Não dá para desfazer nem reaproveitar o nome." Em chave `admin`,
   acrescentar: "Se for a chave deste painel, você volta para a tela de chave." (o painel não sabe o nome da chave que usa).
   204 → snackbar e recarrega; 404 recarrega; 503 snackbar. Se a próxima chamada der 401, o `accessKeyInterceptor` já leva para `/chave`.
- Testes: `keys.api` (URLs, corpo do POST, DELETE com `encodeURIComponent`), diálogo (409 no campo, valor exibido depois do
  201 e ausente da store), "todos (*)" excluindo as outras opções, botão de revogar só em painel ativa.
- Pronto quando, no navegador contra o back de verdade: criar `teste` só com `filesystem`, copiar o comando, rodar no
  terminal e ver no `/mcp` do Claude Code só as tools `filesystem__` (sem reiniciar o gateway); revogar `teste` no painel e o
  Claude Code passar a dar 401; criar `teste` de novo → erro no campo nome.

### Passo 4 do back (upstreams pelo painel): feito em 2026-10-31
1. ✅ `UpstreamDto` novo (ver Tipos), `CreateUpstreamRequest` e, no `UpstreamsApi`: `allowedCommands()`, `create(req)`, `remove(key)`.
2. ✅ Lista de upstreams: chip de origem ("Arquivo"/"Painel") e botão "Novo upstream". Upstream do painel em DOWN com
   `attempts` 0 aparece como "conectando" (é o estado logo depois do cadastro); o polling que já existe mostra o UP.
3. ✅ "Novo upstream" abre um `MatDialog` (`disableClose`) com o aviso no topo: "Cadastrar um upstream roda um processo na
   máquina do gateway."
   - chave (validação local com o padrão do back; dica: "vira o prefixo das tools: `<chave>__<tool>`");
   - comando: campo com autocomplete das opções de `allowed-commands`, aceitando texto livre (ex.: `${NPX_CMD}`); quem decide é o back;
   - args: um por linha num textarea (nada de separar por espaço: caminho com espaço quebraria);
   - env: linhas nome/valor com "adicionar" e "remover". Nome com TOKEN, KEY, SECRET ou PASSWORD e valor que não começa com
     `${` bloqueia o envio: "segredo vai como `${VARIAVEL}`, nunca o valor" (o banco guarda o que for digitado);
   - 400 mostra o `error` do back no topo do diálogo; 409 vira erro no campo chave; 503 snackbar;
   - 201 fecha o diálogo, mostra um snackbar ("docs cadastrado, conectando...") e recarrega a lista.
4. ✅ Detalhe do upstream: nos do painel, uma seção "Definição" com comando, args e env como cadastrados (referências cruas)
   e criado em/por; nos do yml, só "definido no application.yml". Botão "Remover" só nos do painel.
5. ✅ Remover: confirmação "As tools de X somem na hora para todos os clientes. Chaves que citam X continuam citando e voltam
   a vê-lo se ele for cadastrado de novo com a mesma chave." 204 → snackbar e volta para a lista; 404 volta para a lista;
   503 snackbar.
- Testes: `upstreams.api` (URLs e corpo do POST), diálogo (args por linha viram array, env vira objeto, bloqueio de segredo
  literal, 400 com `error` exibido, 409 no campo), botão remover só em `panel`, "conectando" em DOWN com `attempts` 0.
- Feito: `shared/core/api` (`allowedCommands`, `create`, `remove`) e `serverErrorOf` em `shared/core/http` (lê o `error`
  do 400); regras do formulário em `upstream-list/core/upstream-create.ts`; diálogos em `upstream-list/ui/upstream-create-dialog/`
  e `upstream-details/ui/upstream-remove-dialog/`; `upstream-details/ui/upstream-definition/`. `originLabel`, `dateLabel` e
  `byLabel` subiram para `shared/utils/record-labels.ts` e `DATABASE_DOWN_NOTICE` para o `NotificationService` (chaves e
  upstreams usam).
- Falta conferir no navegador, contra o back de verdade, o "Pronto quando" abaixo.
- Pronto quando, no navegador contra o back de verdade: cadastrar `docs` (filesystem apontando para outra pasta, comando
  `${NPX_CMD}`, `PATH` = `${NODE_BIN}:/usr/bin`) → aparece "conectando" e vira UP sozinho, com 14 tools no detalhe; o
  `/mcp` do Claude Code mostra as `docs__`; comando `/bin/sh` mostra o erro do back no diálogo; remover `docs` → some da
  lista, do playground e do Claude Code.

Cuidados da etapa B:
- Só a chave `admin` escreve (o back já garante: a `cli` dá 403 no `/admin`).
- Escrita nunca é otimista sem volta: a tela só fica no estado novo depois do 200.

## Notion remoto: autorizar pelo painel (back passos 2 e 3 feitos em 2026-10-31; front feito no mesmo dia)
O gateway agora fala com upstreams HTTP que exigem OAuth (o Notion remoto). Alguém autoriza uma vez no navegador; o back
guarda e renova o token sozinho. O painel só mostra o estado e dispara o login.
1. ✅ `UpstreamDto.authorization` e `AuthorizeResponse` (ver Tipos); `UpstreamsApi.authorize(key)`.
2. ✅ Lista e detalhe: com `authorization: 'NEEDED'`, chip "Autorização necessária" no lugar do "tentativa N · próxima em…"
   (não há próxima tentativa: o back espera o login). Com `OK`, nada novo na lista; no detalhe, "Autorizado" discreto.
3. ✅ Botão "Autorizar" no detalhe (e na linha da lista) quando `authorization` for `NEEDED`; com `OK`, uma ação secundária
   "Autorizar de novo" (ex.: trocar de workspace). Upstream com `authorization: null` não mostra nada.
   - Clique → `POST .../authorize` → um diálogo curto com o link "Abrir login do Notion" (`<a target="_blank" rel="noopener
     noreferrer">`). Não usar `window.open` depois do `await`: o navegador bloqueia popup que não sai direto do clique.
   - Texto do diálogo: "Faça login e permita o acesso. Depois volte aqui: o upstream conecta sozinho em alguns segundos.
     O link vale 10 minutos." Fechar o diálogo não cancela nada.
   - A URL não vai para store, storage, log nem para a barra de endereço do painel (tem o `state`).
   - Erros: 502 mostra o `error` do back no diálogo; 503 snackbar; 404 volta para a lista.
4. ✅ Depois do login: o polling da lista (10s) já mostra o UP. O detalhe, enquanto estiver `NEEDED` ou DOWN, também faz
   polling (mesmo `pollWhileVisible`), para as tools aparecerem sem recarregar.
- Testes: `upstreams.api` (POST do authorize), chip e botão só em `NEEDED`, "Autorizar de novo" só em `OK`, nada com `null`,
  diálogo com o link (sem `window.open`), 502 com `error` exibido.
- Feito: o diálogo é `shared/ui/authorize-dialog/` (lista e detalhe usam; um caso de uso não importa de outro). Ele pede o
  link ao abrir, então o `<a>` sai direto do clique da pessoa. Cada store só repassa o `authorize` e trata 503 (snackbar)
  e 404 (a lista recarrega, o detalhe volta para a lista); o diálogo fecha nesses dois. O polling do detalhe roda só com DOWN,
  e as tools recarregam quando o status vira UP.
- Falta conferir no navegador, contra o back de verdade, o "Pronto quando" abaixo.
- Pronto quando, no navegador contra o back de verdade: com o `notion-remoto` sem autorização (ou revogado em Notion →
  Configurações → Conexões), o painel mostra "Autorização necessária"; "Autorizar" abre o login do Notion numa aba; ao voltar,
  o upstream vira UP com as tools sem recarregar o painel.

## Notas para depois
- Formulário dinâmico a partir do inputSchema no playground.
- Quando o painel for publicado, a URL base vai para `environment.prod.ts` e a origem nova para `gate.admin.cors-origins`.

## Comandos
```bash
npm start                 # ng serve em localhost:4200 (gateway precisa estar no ar)
npm test                  # testes unitários
npm run build             # build de produção em dist/
# conferir a API sem o painel (desde a fase 4, com a chave do painel; a do CLI dá 403)
A=(-H "Authorization: Bearer $GATE_KEY_PANEL")
curl -s "${A[@]}" http://localhost:8080/admin/upstreams | jq
curl -s "${A[@]}" -X POST http://localhost:8080/admin/tools/filesystem__list_allowed_directories/call \
  -H "Content-Type: application/json" -d '{}' | jq
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/admin/upstreams      # 401
curl -s "${A[@]}" "http://localhost:8080/admin/calls?limit=5" | jq                # últimas chamadas
```


