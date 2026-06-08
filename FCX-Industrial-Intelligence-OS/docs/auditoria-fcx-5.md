# Auditoria FCX 5.0 - Mapa para Evolucao FCX 6.0

Data da analise: 2026-06-07

## 1. Visao geral

O FCX 5.0 esta organizado como um MVP industrial full-stack com:

- Frontend React + Vite em `frontend/`.
- Backend NestJS em `backend/`.
- Banco PostgreSQL/TimescaleDB via Prisma.
- Redis como cache/infra auxiliar.
- EMQX como broker MQTT.
- Grafana + Prometheus + Loki + Alertmanager para observabilidade.
- Docker Compose para execucao local e producao.
- Nginx + Certbot para proxy reverso e SSL em VPS.

A raiz real do projeto esta em:

```text
FCX-Industrial-Intelligence-OS/
```

dentro da pasta externa de mesmo nome.

## 2. Estrutura existente

```text
backend/
  prisma/
    schema.prisma
    seed.js
    migrations/
  src/
    app.module.ts
    main.ts
    database/
    health/
    metrics/
    security/
    modules/
      acquisition/
      agents/
      alarms/
      assets/
      dashboards/
      integrations/
      predictive/
      telemetry/
      users/
      work-orders/

frontend/
  src/
    main.jsx
    style.css
  package.json
  Dockerfile
  Dockerfile.prod
  nginx.conf

observability/
  prometheus/
  alertmanager/
  loki/
  promtail/
  blackbox/
  whatsapp-webhook/

grafana/
  provisioning/
  dashboards/

deployment/
  nginx/

scripts/
  deploy.sh
  start-prod.sh
  setup-ssl.sh
  backup-postgres.sh
  backup-redis.sh
  healthcheck-prod.sh
  logs-prod.sh
  test-whatsapp-alert.sh

docs/
  arquitetura, deploy, seguranca, observabilidade e revisoes
```

## 3. Frontend

### Tecnologia

- React.
- Vite.
- lucide-react para icones.
- CSS proprio em `frontend/src/style.css`.
- Consumo HTTP via `fetch`, apesar de `axios` estar instalado.

### Rotas de tela

O frontend usa roteamento simples baseado em `window.location.pathname`, sem React Router.

Rotas mapeadas:

- `/` redireciona logicamente para `/dashboard`.
- `/dashboard`
- `/predictive`
- `/assets`
- `/telemetry`
- `/alarms`
- `/work-orders`
- `/integrations`

### Chamadas principais de API

- `/dashboards`
- `/predictive/dashboard`
- `/assets`
- `/telemetry?limit=250`
- `/alarms`
- `/work-orders`
- `/integrations`

### Pontos de atencao do frontend

- Nao ha login, sessao ou gerenciamento de identidade no frontend.
- As telas usam apenas leitura de dados; os CRUDs do backend existem, mas a UI atual nao parece operar criacao/edicao/exclusao completa.
- `axios` esta instalado, mas o codigo usa `fetch`.
- A API protegida em producao aceita `X-API-Key` ou Bearer JWT, mas o frontend atual nao injeta esses headers.
- O roteamento manual deve ser preservado ou substituido com cuidado no FCX 6.0, porque o Nginx do frontend serve SPA com fallback para `index.html`.

## 4. Backend

### Tecnologia

- NestJS.
- Prisma Client.
- PostgreSQL/TimescaleDB.
- MQTT via pacote `mqtt`.
- Modbus TCP via `modbus-serial`.
- Axios para conectores HTTP industriais.
- Helmet, compression e ValidationPipe global.

### Modulos importados no AppModule

- `ConfigModule`
- `HealthModule`
- `MetricsModule`
- `DatabaseModule`
- `AssetsModule`
- `TelemetryModule`
- `AlarmsModule`
- `WorkOrdersModule`
- `UsersModule`
- `DashboardsModule`
- `PredictiveModule`
- `AcquisitionModule`
- `IntegrationsModule`
- `AgentsModule`

### Rotas REST mapeadas

Health:

- `GET /health`

Metrics:

- `GET /metrics`

Assets:

- `GET /assets`
- `GET /assets/:id`
- `POST /assets`
- `PATCH /assets/:id`
- `DELETE /assets/:id`

Telemetry:

- `GET /telemetry`
- `GET /telemetry/:id`
- `POST /telemetry`
- `PATCH /telemetry/:id`
- `DELETE /telemetry/:id`

Alarms:

- `GET /alarms`
- `GET /alarms/:id`
- `POST /alarms`
- `PATCH /alarms/:id`
- `DELETE /alarms/:id`

Work Orders:

- `GET /work-orders`
- `GET /work-orders/:id`
- `POST /work-orders`
- `PATCH /work-orders/:id`
- `DELETE /work-orders/:id`

Users:

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

Dashboards:

- `GET /dashboards`

Predictive:

- `GET /predictive/health`
- `GET /predictive/anomalies`
- `GET /predictive/anomaly`
- `GET /predictive/failure`
- `GET /predictive/forecast`
- `GET /predictive/dashboard`

Integrations:

- `GET /integrations`
- `GET /integrations/architecture`
- `POST /integrations/ingest`
- `POST /integrations/modbus/read`
- `POST /integrations/carel-boss/pull`
- `POST /integrations/sitrad-pro/pull`
- `POST /integrations/thingsboard/pull`
- `POST /integrations/fcx-gateway/pull`

Acquisition:

- `GET /acquisition/architecture`
- `POST /acquisition/ingest`
- `POST /acquisition/mqtt/publish`
- `POST /acquisition/modbus/read`
- `POST /acquisition/carel-boss/pull`
- `POST /acquisition/sitrad-pro/pull`
- `POST /acquisition/thingsboard/pull`

Agents:

- `GET /agents`

### Seguranca e autenticacao

Existe um middleware customizado em `backend/src/security/http-security.ts`.

Comportamento atual:

- `SECURITY_AUTH_ENABLED=false` desativa protecao.
- Em producao, se nao definido, a protecao liga por padrao.
- Aceita `X-API-Key`.
- Aceita `Authorization: Bearer <JWT HS256>`.
- Protege metodos mutaveis (`POST`, `PATCH`, `DELETE`).
- Protege todas as rotas `/users`.
- Protege escrita em `/integrations` e `/acquisition`.
- `GET /health` permanece publico.

Nao existe ainda um modulo formal de autenticacao com login, senha, refresh token, RBAC por guard NestJS ou multi-tenant.

## 5. Banco de dados

### ORM e provider

- Prisma.
- PostgreSQL.
- TimescaleDB instalado na infraestrutura, mas o schema Prisma nao declara hypertables diretamente.

### Entidades principais

- `Asset`
- `Telemetry`
- `Alarm`
- `WorkOrder`
- `User`

### Entidades de aquisicao industrial

- `TelemetryRaw`
- `TelemetryProcessed`
- `AlarmEvent`

### Observacoes sobre modelo de dados

- Existem duas linhas de telemetria:
  - Legado/MVP: `telemetry` e `alarms`.
  - Aquisicao industrial: `telemetry_raw`, `telemetry_processed`, `alarm_events`.
- Dashboards executivos e motor preditivo ainda usam majoritariamente `telemetry` e `alarms`.
- A aquisicao real grava em `telemetry_raw`, `telemetry_processed` e `alarm_events`.
- `TelemetryProcessed.rawId` e apenas string opcional, sem relacao Prisma formal com `TelemetryRaw`.
- `AlarmEvent.severidade` e `AlarmEvent.status` sao strings, enquanto `Alarm` usa enums.
- `User` possui `nome`, `email`, `role`, `status`, mas nao possui senha/hash/identidade externa.

## 6. Ingestao, MQTT e integracoes industriais

### Conectores existentes

Em `integrations/`:

- MQTT EMQX.
- Modbus TCP.
- Carel BOSS.
- Sitrad Pro.
- ThingsBoard.
- FCX Gateway.
- Data Ingestion.
- Telemetry Processing.
- Alarm Engine.
- Predictive Engine.

Em `acquisition/`:

- MQTT Gateway.
- MQTT Subscriber.
- MQTT Publisher.
- Modbus TCP Gateway.
- Carel BOSS Connector.
- Sitrad Pro Connector.
- ThingsBoard Connector.
- Acquisition Telemetry.
- Acquisition Alarm.
- Acquisition Asset.

### Ponto importante

Ha dois fluxos MQTT ouvindo o mesmo topico padrao `fcx/telemetry/+`:

- `MqttEmqxService` em `integrations/`, que grava no fluxo legado via `DataIngestionService`.
- `MqttSubscriberService` em `acquisition/`, que grava em `telemetry_raw` e `telemetry_processed`.

Para o FCX 6.0, esse ponto deve ser decidido arquiteturalmente: manter compatibilidade legada ou consolidar tudo na camada de aquisicao.

## 7. Observabilidade

### Stack implementada

- Grafana.
- Prometheus.
- Loki.
- Promtail.
- Alertmanager.
- Node Exporter.
- cAdvisor.
- PostgreSQL Exporter.
- Redis Exporter.
- Blackbox Exporter.
- Webhook WhatsApp.

### Backend metrics

O backend expoe:

- `GET /metrics`
- `fcx_api_up`
- `fcx_api_uptime_seconds`
- `fcx_api_memory_rss_bytes`
- `fcx_api_memory_heap_used_bytes`
- `fcx_api_http_requests_total`
- metricas de duracao HTTP em formato sum/count.

### Dashboards Grafana

- `FCX Operations Overview`
- `FCX Data Services - PostgreSQL Redis MQTT`

### Alertas Prometheus

- API indisponivel.
- Erro HTTP 5xx alto.
- CPU alta.
- RAM alta.
- Disco alto.
- PostgreSQL indisponivel.
- Muitas conexoes PostgreSQL.
- Redis indisponivel.
- Redis com memoria alta.
- EMQX/MQTT indisponivel.
- Container reiniciando.

## 8. Docker e deploy

### Local

Arquivo principal:

- `docker-compose.yml`

Servicos locais:

- PostgreSQL/TimescaleDB.
- Redis.
- EMQX.
- Backend.
- Frontend.
- MQTT simulator por profile `simulation`.
- Grafana no compose local, conforme restante do arquivo.

### Producao

Arquivos:

- `docker-compose.production.yml`
- `docker-compose.prod.yml` sincronizado com o compose de producao.
- `backend/Dockerfile.prod`
- `frontend/Dockerfile.prod`
- `deployment/nginx/nginx.production.template.conf`
- `deployment/nginx/nginx.bootstrap.template.conf`
- scripts em `scripts/`.

Servicos de producao:

- postgres.
- redis.
- emqx.
- backend.
- frontend.
- grafana.
- prometheus.
- alertmanager.
- loki.
- promtail.
- node-exporter.
- cadvisor.
- postgres-exporter.
- redis-exporter.
- blackbox-exporter.
- whatsapp-alerts.
- nginx.
- certbot.

## 9. Dependencias principais

### Backend

- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/platform-express`
- `@nestjs/config`
- `@nestjs/jwt`
- `@nestjs/passport`
- `@nestjs/schedule`
- `@prisma/client`
- `prisma`
- `class-validator`
- `class-transformer`
- `compression`
- `helmet`
- `axios`
- `mqtt`
- `modbus-serial`
- `ioredis`
- `bcrypt`
- `rxjs`
- `reflect-metadata`

### Frontend

- `react`
- `react-dom`
- `vite`
- `@vitejs/plugin-react`
- `lucide-react`
- `axios`

### Infra/observabilidade

- TimescaleDB PostgreSQL.
- Redis.
- EMQX.
- Nginx.
- Certbot.
- Grafana.
- Prometheus.
- Alertmanager.
- Loki.
- Promtail.
- Node Exporter.
- cAdvisor.
- PostgreSQL Exporter.
- Redis Exporter.
- Blackbox Exporter.

## 10. Pontos frageis identificados

### Arquitetura e dominio

- Fluxo duplicado de MQTT entre `integrations` e `acquisition`.
- Dashboards e preditivo ainda dependem das tabelas legadas `telemetry` e `alarms`.
- Dados reais de aquisicao ficam em `telemetry_processed` e `alarm_events`, que nao parecem ser a fonte principal dos dashboards executivos.
- `AgentsModule` existe, mas parece pouco conectado ao restante da aplicacao.
- Nao ha fronteira clara entre "integrations" e "acquisition"; ambos implementam conectores industriais.

### Backend

- Controllers ainda aceitam `Record<string, unknown>` em varios CRUDs.
- Ha whitelist em services, mas ainda nao ha DTOs completos com validacao tipada por rota.
- Autenticacao e middleware customizado, nao Guard NestJS padrao.
- Nao ha RBAC real por papel (`ADMIN`, `MANAGER`, etc.).
- `User` nao representa credenciais de login.
- O endpoint `/metrics` esta publico se a rota nao for filtrada por proxy/firewall.
- O seed apaga dados antes de recriar massa de demonstracao.

### Banco

- TimescaleDB esta na stack, mas faltam politicas explicitas de hypertable, compressao e retencao no schema/migrations atuais.
- `telemetry_raw` pode crescer rapidamente sem retencao automatica.
- `TelemetryProcessed.rawId` nao tem foreign key formal para `TelemetryRaw`.
- Parte do dominio usa enums Prisma e parte usa strings livres.

### Frontend

- Nao ha autenticacao no client.
- As chamadas `fetch` nao enviam `X-API-Key` ou Bearer token.
- Nao ha tratamento robusto de erros, retry, timeout ou estados de permissao.
- O frontend atual e majoritariamente leitura; CRUD completo existe mais no backend do que na UI.

### Dependencias

- `package.json` de backend e frontend usa `latest` em praticamente todas as dependencias.
- Nao foi identificado lockfile no levantamento.
- `axios` parece desnecessario no frontend atual.
- Dependencias de auth (`@nestjs/jwt`, `@nestjs/passport`, `bcrypt`) existem, mas nao ha modulo completo de auth.

### Docker/operacao

- Ambiente local ainda usa imagens `latest` e secrets fracos como default.
- Compose local e compose de producao divergem bastante.
- cAdvisor exige acesso privilegiado ao host Docker.
- WhatsApp Alert Webhook depende de credenciais externas da Meta Cloud API.

## 11. O que NAO pode ser quebrado no FCX 6.0

### Contratos de API usados pelo frontend

Preservar ou versionar cuidadosamente:

- `GET /dashboards`
- `GET /predictive/dashboard`
- `GET /assets`
- `GET /telemetry?limit=250`
- `GET /alarms`
- `GET /work-orders`
- `GET /integrations`
- `GET /health`
- `GET /metrics`

### Rotas de frontend

Preservar:

- `/dashboard`
- `/predictive`
- `/assets`
- `/telemetry`
- `/alarms`
- `/work-orders`
- `/integrations`

### Nomes e campos centrais do Prisma

Evitar quebrar sem migration planejada:

- `Asset.nome`, `tipo`, `unidade`, `criticidade`, `status`.
- `Telemetry.assetId`, `timestamp`, `temperatura`, `vibracao`, `corrente`, `tensao`, `potencia`.
- `Alarm.assetId`, `severidade`, `status`.
- `WorkOrder.numeroOs`, `assetId`, `status`, `prioridade`.
- `TelemetryRaw.payload`, `source`, `protocol`, `topic`.
- `TelemetryProcessed.assetId`, `timestamp`, metricas normalizadas.
- `AlarmEvent.assetId`, `severidade`, `status`.

### Infra e operacao

Preservar:

- `docker-compose.production.yml`.
- `docker-compose.prod.yml`, por compatibilidade.
- `backend/Dockerfile.prod`.
- `frontend/Dockerfile.prod`.
- Scripts de deploy e start:
  - `scripts/deploy.sh`
  - `scripts/start-prod.sh`
  - `scripts/setup-ssl.sh`
  - `scripts/healthcheck-prod.sh`
- Nginx templates em `deployment/nginx/`.
- Volumes de producao:
  - `postgres_production_data`
  - `redis_production_data`
  - `emqx_production_data`
  - `grafana_production_data`
  - `prometheus_production_data`
  - `loki_production_data`

### Variaveis de ambiente criticas

Preservar nomes ou manter compatibilidade:

- `DATABASE_URL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `REDIS_URL`
- `REDIS_PASSWORD`
- `MQTT_URL`
- `MQTT_TELEMETRY_TOPIC`
- `JWT_SECRET`
- `API_KEY`
- `SECURITY_AUTH_ENABLED`
- `CORS_ORIGIN`
- `PUBLIC_API_URL`
- `GRAFANA_ROOT_URL`
- `EMQX_DASHBOARD_USER`
- `EMQX_DASHBOARD_PASSWORD`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_TO`

### Topicos MQTT

Preservar ou migrar com bridge:

- `fcx/telemetry/+`
- `fcx/telemetry/{assetId}` usado pelo simulador.

## 12. Recomendacoes para iniciar o FCX 6.0

1. Definir uma unica camada oficial de ingestao.
   - Recomendacao: `acquisition` como caminho principal.
   - `integrations` pode virar camada de conectores ou ser deprecada gradualmente.

2. Migrar dashboards e preditivo para `telemetry_processed` e `alarm_events`.
   - Manter compatibilidade temporaria com `telemetry` e `alarms`.

3. Introduzir AuthModule formal.
   - Login.
   - Hash de senha ou identidade externa.
   - Guards NestJS.
   - RBAC por `UserRole`.
   - Tenant/cliente se o FCX 6.0 for SaaS multi-cliente.

4. Criar DTOs por rota.
   - Substituir `Record<string, unknown>`.
   - Validar enums, datas, ids e ranges industriais.

5. Criar versao de API.
   - Exemplo: `/api/v1`.
   - Manter aliases temporarios para rotas atuais.

6. Formalizar TimescaleDB.
   - Hypertables.
   - Retencao.
   - Compressao.
   - Agregados continuos.

7. Fixar dependencias.
   - Remover `latest`.
   - Gerar lockfiles.
   - Criar pipeline de build/test.

8. Separar responsabilidades de UI.
   - Introduzir roteador formal se necessario.
   - Criar camada de API client com token/API key.
   - Preparar telas de CRUD real.

## 13. Conclusao

O FCX 5.0 e um MVP industrial funcional com boa cobertura de modulos, deploy e observabilidade. O principal cuidado antes do FCX 6.0 e nao confundir as duas linhas de dados existentes:

- Linha MVP/legada: `telemetry`, `alarms`, dashboards e preditivo atuais.
- Linha industrial/aquisicao: `telemetry_raw`, `telemetry_processed`, `alarm_events`.

O FCX 6.0 deve consolidar a arquitetura em torno de aquisicao real, autenticacao formal, multi-tenant, validacao forte e TimescaleDB operacional, preservando os contratos de frontend, rotas REST publicadas, scripts de deploy e topicos MQTT atuais ate que exista uma migracao versionada.
