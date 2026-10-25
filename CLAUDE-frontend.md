# MCP Gate of Truth: painel admin (frontend)

Painel web para operar o gateway MCP Gate of Truth, no estilo do painel do Bifrost.
- Projeto Angular separado do backend. Consome só a API REST `/admin` do gateway (Spring), nunca o `/mcp`.
- O backend tem o próprio CLAUDE.md. Este arquivo trata só do frontend; nada daqui vai para lá.
- Glossário mínimo: **upstream** é um servidor MCP de fora que o gateway conecta (ex.: `notion`, `filesystem`).
  **Chave** é o nome do upstream no application.yml do gateway. **Nome exposto** de uma tool é `<chave>__<nome original>`
  (ex.: `notion__API-post-page`).

## Escopo
**Etapa A (agora): só leitura.**
- Lista de upstreams com status (`UP`/`DOWN`, nome e versão que o servidor anuncia, quantidade de tools).
- Detalhe de um upstream com as tools dele (nome exposto, nome original, descrição, inputSchema).
- Playground: escolher uma tool, preencher os argumentos em JSON, chamar e ver o resultado cru.

**Etapa B (depois da fase 4 do backend): edição.** Ligar e desligar tools, cadastrar upstreams, API keys,
log de chamadas (este depois da fase 5). Não adiantar nada da etapa B: sem botões desabilitados "para depois",
sem telas vazias, sem serviços de escrita.

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
- Sem autenticação na etapa A (o backend ainda não tem; chega na fase 4).

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
- Sidenav fixa (Upstreams, Playground) + toolbar com logo, nome e botão de modo. Conteúdo com largura máxima de 1200px.
- Listas: `mat-table`. Status: `mat-chip` com a cor semântica. inputSchema: `mat-expansion-panel` fechado por padrão.
- Bordas finas (1px, `--got-border`) e raio do Material. Sem sombras fortes, sem cantos chanfrados, sem brilho nas bordas.
- Uma animação só: o círculo de transmutação girando nos loadings (principalmente o `GET /admin/upstreams`, que pode demorar).
  Respeitar `prefers-reduced-motion`.
- Logo: silhueta simples do portão, em SVG de uma cor (herda `currentColor`).

### Textos temáticos
O termo técnico continua visível; o temático vem junto, não no lugar.
- UP → "Portão aberto · UP"; DOWN → "Portão fechado · DOWN".
- Botão de chamar tool → "Executar transmutação".
- Etapa B, quando existir: log de chamadas → "Registros do alquimista".
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
    │   ├── identity/        auth e guards (vazio na etapa A; ver abaixo)
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
    └── playground/
        ├── playground.routes.ts
        └── tool-call/
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

## identity/ na etapa A
A pasta existe para manter o desenho, mas fica vazia (ou só com um README curto). Quando o backend ganhar API key (fase 4),
entram aqui o interceptor que anexa a credencial e o guard das rotas. Não criar guard que sempre retorna `true`.

## Contrato da API /admin (o que o backend expõe hoje)
Fonte da verdade: o CLAUDE.md do backend, seção "API /admin". Se divergir, vale o backend; atualizar aqui e nos DTOs.

```
GET  /admin/upstreams
     → [{ key, serverName, serverVersion, status: "UP" | "DOWN", toolCount }]
GET  /admin/upstreams/{key}/tools
     → [{ name, originalName, description, inputSchema }]     (ordenado por name; key desconhecida → 404)
POST /admin/tools/{name}/call
     body: o objeto de arguments direto, ex.: {} ou {"path": "..."}  (sem envelope { arguments })
     → CallToolResult do MCP: { content: [{ type, ... }], isError?, structuredContent? }   (name desconhecido → 404)
```
- `name` é sempre o nome exposto (`<chave>__<original>`). A chave do upstream de uma tool é o trecho antes do primeiro `__`
  (helper em `shared/utils`), já que o `ToolDto` não traz a chave.
- Não existe endpoint de um upstream só nem de todas as tools:
  - Detalhe do upstream: cabeçalho a partir do item de `GET /admin/upstreams`, tools de `/admin/upstreams/{key}/tools`.
  - Seletor do playground: primeiro escolhe o upstream, depois a tool dele (os mesmos dois endpoints). Com `?tool=<nome>`
    na URL, já vem tudo selecionado.
- `isError` pode não vir no JSON: ausente é `false`. `structuredContent` é opcional; mostrar só se vier.
- `GET /admin/upstreams` faz `ping` em cada upstream e pode demorar (até 60s se um upstream travar). Tela com loading,
  sem recarregar a lista a cada navegação; botão "atualizar" explícito.
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
  serverName: string;
  serverVersion: string;
  status: UpstreamStatus;
  toolCount: number;
}

// tool.dto.ts  ←  admin/ToolDto (record)
export type JsonSchema = Record<string, unknown>;   // JSON Schema cru; tipar mais só se o formulário dinâmico vier
export interface ToolDto {
  name: string;           // nome exposto, com prefixo
  originalName: string;
  description: string | null;
  inputSchema: JsonSchema;
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

Fica fora da etapa A: autenticação, qualquer escrita além da chamada de tool, atualização em tempo real (polling ou SSE),
formulário gerado a partir do inputSchema (o JSON cru basta).

## Notas para depois
- Formulário dinâmico a partir do inputSchema no playground.
- Atualizar o status dos upstreams sozinho quando o backend tiver resiliência (fase 3) e `list_changed`.
- Quando o painel for publicado, a URL base vai para `environment.prod.ts` e a origem nova para `gate.admin.cors-origins`.

## Comandos
```bash
npm start                 # ng serve em localhost:4200 (gateway precisa estar no ar)
npm test                  # testes unitários
npm run build             # build de produção em dist/
curl -s http://localhost:8080/admin/upstreams | jq      # conferir a API sem o painel
curl -s -X POST http://localhost:8080/admin/tools/filesystem__list_allowed_directories/call \
  -H "Content-Type: application/json" -d '{}' | jq
```

