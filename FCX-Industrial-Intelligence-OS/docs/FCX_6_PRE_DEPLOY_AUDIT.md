# FCX 6.0 Pre-Deploy Audit

Data: 2026-06-07

## Status final

**BLOCKED**

Motivo: a instalacao de dependencias foi bloqueada pelo npm em modo offline/cache sem pacotes locais suficientes. Por isso, os builds de backend e frontend nao puderam ser validados neste ambiente.

## Comandos executados

```powershell
node --version
npm.cmd --version
npm.cmd install
npm.cmd test
npm.cmd run lint
npm.cmd run build
node fcx-6.0\packages\fcx-module-adapters.test.js
node fcx-6.0\packages\fcx-trading-agents-adapter\test\adapter.test.js
docker --version
docker compose version
docker compose -f docker-compose.production.yml config --quiet
docker compose -f docker-compose.prod.yml config --quiet
docker compose --env-file .env.production.example -f docker-compose.production.yml config --quiet
docker compose --env-file .env.production.example -f docker-compose.prod.yml config --quiet
```

## Instalacao

Arquivos verificados:

- `backend/package.json`
- `frontend/package.json`
- `fcx-6.0/packages/fcx-trading-agents-adapter/package.json`

Lockfiles:

- `package-lock.json`: ausente.
- `yarn.lock`: ausente.
- `pnpm-lock.yaml`: ausente.

Erro encontrado:

```text
npm error code ENOTCACHED
request to https://registry.npmjs.org/... failed: cache mode is 'only-if-cached' but no cached response is available.
```

Impacto:

- Nao foi possivel instalar dependencias.
- Nao foi possivel gerar lockfile confiavel neste ambiente.
- `nest` e `vite` nao ficaram disponiveis localmente.

Pendencia obrigatoria antes da VPS:

- Rodar `npm install` em ambiente com acesso ao npm registry.
- Versionar `backend/package-lock.json` e `frontend/package-lock.json`.
- Avaliar troca de dependencias `"latest"` por versoes fixas.

## Build

Backend:

```text
npm.cmd run build
'nest' is not recognized as an internal or external command
```

Frontend:

```text
npm.cmd run build
'vite' is not recognized as an internal or external command
```

Packages internos:

- `fcx-module-adapters.test.js`: passou.
- `fcx-trading-agents-adapter`: passou.
- Os adapters atuais sao CommonJS sem etapa de build.

Status:

- Build de backend: bloqueado por dependencias ausentes.
- Build de frontend: bloqueado por dependencias ausentes.
- Build/validacao de packages internos: OK para os adapters sem transpilacao.

## Testes

Criados:

- `backend/tests/predeploy.test.js`
- `backend/scripts/lint-basic.js`

Cobertura minima adicionada:

- `/api/health` e `/health`
- inicializacao do `AppModule`
- healthcheck com contrato de banco e Redis
- feature flags FCX 6.0
- fallback de modulos externos
- bloqueio de modo financeiro real

Resultados:

```text
npm.cmd test
5 tests passed

node fcx-6.0\packages\fcx-module-adapters.test.js
6 tests passed

node fcx-6.0\packages\fcx-trading-agents-adapter\test\adapter.test.js
4 tests passed
```

Total: **15 testes passaram**.

## Lint e formatacao

Criado lint basico:

```powershell
npm.cmd run lint
```

Resultado:

```text
basic lint passed
```

Verificacoes incluidas:

- endpoint `/api/health`
- rate limit basico
- possiveis secrets reais
- termos proibidos de execucao financeira real

## Variaveis de ambiente

Arquivos verificados/atualizados:

- `.env.example`
- `.env.production.example`
- `backend/.env.example`
- `fcx-6.0/.env.example`

Adicionado:

```env
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=600
ENABLE_AGENT_SKILLS=false
ENABLE_LIBRECHAT=false
ENABLE_LANGCHAIN=true
ENABLE_NANGO=false
ENABLE_QUANTDINGER=false
ENABLE_UNDERSTAND_ANYTHING=false
```

Secrets:

- Nenhum padrao de chave real OpenAI, GitHub, Slack ou AWS foi encontrado nos exemplos ou em `.env.production`.

## Banco de dados

ORM:

- Prisma.

Arquivos:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20260602130000_init_mvp/migration.sql`
- `backend/prisma/migrations/20260602160000_data_acquisition_layer/migration.sql`
- `backend/prisma/seed.js`

Migration production-safe:

- Ja existe no entrypoint de producao:

```sh
npx prisma migrate deploy
```

`DATABASE_URL`:

- Documentado em `.env.example`, `.env.production.example` e `backend/.env.example`.

## Docker

Arquivos verificados:

- `backend/Dockerfile.prod`
- `frontend/Dockerfile.prod`
- `docker-compose.prod.yml`
- `docker-compose.production.yml`

Validacao:

```powershell
docker compose --env-file .env.production.example -f docker-compose.production.yml config --quiet
docker compose --env-file .env.production.example -f docker-compose.prod.yml config --quiet
```

Resultado: OK.

Correcoes feitas:

- Variaveis FCX 6.0 e feature flags foram adicionadas ao ambiente do backend nos dois compose de producao.
- `RATE_LIMIT_WINDOW_MS` e `RATE_LIMIT_MAX` foram adicionados ao ambiente do backend.

Observacao:

- O healthcheck Docker continua usando `/health`, mantido por compatibilidade.
- O novo contrato `/api/health` tambem foi adicionado.

## Seguranca

Verificado/corrigido:

- CORS configurado por `CORS_ORIGIN`.
- `JWT_SECRET` e `API_KEY` obrigatorios quando `SECURITY_AUTH_ENABLED=true`.
- Rate limit basico adicionado no middleware HTTP.
- Logs de fallback nao imprimem tokens.
- QuantDinger bloqueia modo diferente de `research` ou `simulation`.
- Nenhuma ordem financeira real foi habilitada.
- `/api/health` e `/health` ficam publicos para healthcheck.

## Healthcheck

Endpoint garantido:

```http
GET /api/health
```

Tambem mantido:

```http
GET /health
```

Resposta esperada quando Postgres e Redis estiverem conectados:

```json
{
  "status": "ok",
  "version": "6.0",
  "database": "connected",
  "redis": "connected"
}
```

Se banco ou Redis estiverem indisponiveis, o endpoint retorna `status: "degraded"` e marca a dependencia como `disconnected`.

## Correcoes feitas

- Criado `HealthService` com checagem de Prisma/PostgreSQL e Redis.
- `HealthController` agora atende `/health` e `/api/health`.
- Criado rate limit basico em `securityMiddleware`.
- `/api/health` liberado da autenticacao.
- Criados testes minimos de pre-deploy.
- Criado lint basico de seguranca/contrato.
- Adicionadas variaveis de rate limit.
- Feature flags FCX 6.0 propagadas para Docker Compose de producao.

## Pendencias

Obrigatorias:

- Rodar `npm install` em ambiente com acesso ao registry.
- Gerar e versionar lockfiles.
- Rodar `npm run build` no backend.
- Rodar `npm run build` no frontend.
- Rodar `npx prisma generate` apos instalacao.
- Rodar `docker compose --env-file .env.production -f docker-compose.production.yml build` em ambiente com rede.

Recomendadas:

- Substituir `"latest"` por versoes fixas em backend e frontend.
- Adicionar testes NestJS reais com `@nestjs/testing` depois da instalacao.
- Adicionar lint formal com ESLint/Prettier.
- Adicionar healthcheck com timeout configuravel para Redis/PostgreSQL.

Pode esperar:

- Testes E2E de dashboard.
- Testes reais de conectores externos Nango/LibreChat/LangChain.
- Build dedicado por adapter FCX 6.0.
