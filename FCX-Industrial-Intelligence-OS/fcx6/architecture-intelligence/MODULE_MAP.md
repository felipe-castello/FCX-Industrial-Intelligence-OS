# Module Map - FCX Architecture Intelligence

## Objetivo

Mapear os módulos existentes e planejados do FCX para servir como base de documentação viva, análise de impacto e orientação do FCX 6.0.

## 1. Frontend

### Localização

```text
frontend/
```

### Responsabilidade

- Interface web do FCX.
- Dashboards operacionais.
- Listagens de ativos, telemetria, alarmes e ordens.
- Tela preditiva.
- Tela de integrações.

### Rotas principais

- `/dashboard`
- `/predictive`
- `/assets`
- `/telemetry`
- `/alarms`
- `/work-orders`
- `/integrations`

### Dependências

- Backend API.
- `VITE_API_URL`.
- Nginx SPA fallback em produção.

### Riscos

- Não envia autenticação para APIs protegidas.
- Roteamento manual.
- Contratos de API não versionados.

## 2. Backend

### Localização

```text
backend/
```

### Responsabilidade

- API NestJS.
- Regras de domínio.
- Integrações industriais.
- Preditivo.
- Dashboards.
- Segurança HTTP.
- Métricas.

### Módulos principais

- `AssetsModule`
- `TelemetryModule`
- `AlarmsModule`
- `WorkOrdersModule`
- `UsersModule`
- `DashboardsModule`
- `PredictiveModule`
- `IntegrationsModule`
- `AcquisitionModule`
- `AgentsModule`
- `HealthModule`
- `MetricsModule`
- `DatabaseModule`

### Endpoints críticos

- `/health`
- `/metrics`
- `/dashboards`
- `/predictive/*`
- `/assets`
- `/telemetry`
- `/alarms`
- `/work-orders`
- `/integrations`
- `/acquisition`

### Riscos

- Parte dos controllers ainda aceita payload genérico.
- Autenticação customizada, sem AuthModule formal.
- Separação entre `integrations` e `acquisition` ainda precisa decisão arquitetural.

## 3. Banco

### Localização

```text
backend/prisma/
```

### Responsabilidade

- Modelagem relacional.
- Entidades operacionais.
- Telemetria.
- Alarmes.
- Ordens de serviço.
- Usuários.

### Entidades

- `Asset`
- `Telemetry`
- `Alarm`
- `WorkOrder`
- `User`
- `TelemetryRaw`
- `TelemetryProcessed`
- `AlarmEvent`

### Riscos

- Duas linhas de dados: legado e aquisição real.
- TimescaleDB ainda sem política formal de hypertables/retention no modelo atual.
- `User` não possui credenciais de login.

## 4. Agentes

### Localização

```text
fcx6/agent-skills/
fcx6/ai-command-center/
fcx6/agent-orchestration/
```

### Responsabilidade

- Definir habilidades.
- Registrar agentes.
- Planejar orquestração.
- Planejar interface com LibreChat.
- Planejar MCP Tools.

### Agentes planejados

- FCX Master Agent.
- FCX Technical Knowledge Vault Agent.
- FCX Industrial Intelligence Agent.
- FCX Electronics Lab Agent.
- FCX Field Service Agent.
- FCX Sports Quant Agent.
- FCX Trade Intelligence Agent.

### Riscos

- Agentes sem auditoria podem gerar recomendações perigosas.
- Ações de escrita precisam aprovação humana.
- Labs devem ficar isolados do core industrial.

## 5. Integrações

### Localização atual

```text
backend/src/modules/integrations/
backend/src/modules/acquisition/
```

### Localização planejada FCX 6.0

```text
fcx6/integration-hub/
```

### Responsabilidade

- Protocolos industriais.
- Conectores SaaS.
- OAuth.
- Sync.
- Webhooks.

### Integrações atuais

- MQTT/EMQX.
- Modbus TCP.
- Carel BOSS.
- Sitrad Pro.
- ThingsBoard.
- FCX Gateway.

### Integrações planejadas

- GitHub.
- Google Drive.
- Gmail.
- Microsoft 365.
- WhatsApp.
- CRM.
- ERP.

### Riscos

- Duplicidade MQTT entre `integrations` e `acquisition`.
- Escopos OAuth excessivos.
- Dados externos sensíveis.
- Escrita externa deve ser bloqueada no MVP.

## 6. Dashboards

### Localização

```text
backend/src/modules/dashboards/
frontend/src/main.jsx
grafana/dashboards/
grafana/provisioning/
```

### Responsabilidade

- KPIs executivos.
- Widgets industriais.
- Observabilidade.
- Métricas operacionais.

### Dashboards existentes

- Dashboard web FCX.
- Predictive dashboard.
- Grafana Operations Overview.
- Grafana Data Services.

### Riscos

- Dashboard executivo ainda usa tabelas legadas `telemetry` e `alarms`.
- Dados reais em `telemetry_processed` podem não aparecer no dashboard principal.
- Métricas sem fonte clara podem gerar decisão errada.

## 7. Knowledge Vault

### Localização planejada

```text
fcx6/knowledge-intelligence/
```

### Responsabilidade

- RAG.
- Document pipeline.
- Banco vetorial.
- Fontes técnicas.
- Citações.
- Busca documental.

### Fontes planejadas

- PDFs técnicos.
- Danfoss.
- Bitzer.
- Carel.
- Full Gauge.
- NR10.
- PMOC.
- Relatórios técnicos.
- Ordens de serviço.

### Riscos

- Documento sem versão pode gerar resposta errada.
- Falta de tenant isolation é risco crítico.
- RAG sem citação não deve ser usado para decisão técnica.

## Mapa de dependências resumido

```text
Frontend
  -> Backend APIs
  -> Dashboards

Backend
  -> Prisma/PostgreSQL
  -> Redis
  -> EMQX
  -> Integrações industriais

Dashboards
  -> Backend
  -> PostgreSQL
  -> Prometheus
  -> Loki

Agentes FCX 6.0
  -> MCP Tools
  -> Backend APIs
  -> Knowledge Vault
  -> Integration Hub

Knowledge Vault
  -> Document Sources
  -> Vector Database
  -> Agents

Integration Hub
  -> Nango
  -> SaaS externos
  -> FCX modules
```

## Módulos que exigem maior cuidado no FCX 6.0

- Autenticação e RBAC.
- Migração de dados legados para aquisição real.
- Ingestão MQTT.
- Knowledge Vault multi-tenant.
- Agent Orchestration com ações controladas.
- Integrações OAuth.
- Dashboards usados por operação.

## Não implementar ainda

- Grafo persistente.
- Scanner automático.
- Visualizador.
- Motor de impacto.
