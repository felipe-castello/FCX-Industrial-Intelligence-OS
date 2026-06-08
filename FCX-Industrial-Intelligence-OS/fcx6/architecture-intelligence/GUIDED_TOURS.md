# Guided Tours - FCX Architecture Intelligence

## Objetivo

Definir tours guiados para ajudar novos desenvolvedores, operadores, arquitetos e agentes a entenderem a arquitetura do FCX.

## Conceito

Um tour guiado é uma sequência de pontos da arquitetura com explicações, links, riscos e próximos passos.

## Público-alvo

- Desenvolvedores.
- Arquitetos.
- SRE/DevOps.
- Product Managers.
- Engenheiros industriais.
- Agentes de software.

## Tours iniciais

### 1. Tour do Frontend

Objetivo:

- Entender a interface React/Vite.

Pontos:

- `frontend/src/main.jsx`
- Rotas:
  - `/dashboard`
  - `/predictive`
  - `/assets`
  - `/telemetry`
  - `/alarms`
  - `/work-orders`
  - `/integrations`
- `frontend/src/style.css`
- `frontend/nginx.conf`

Perguntas respondidas:

- Onde as páginas são definidas?
- Quais APIs o frontend consome?
- Como a SPA é servida em produção?

### 2. Tour do Backend

Objetivo:

- Entender a aplicação NestJS.

Pontos:

- `backend/src/app.module.ts`
- `backend/src/main.ts`
- `backend/src/modules/*`
- `backend/src/database/prisma.service.ts`
- `backend/src/security/http-security.ts`
- `backend/src/metrics`

Perguntas respondidas:

- Quais módulos existem?
- Como segurança é aplicada?
- Onde ficam health e metrics?
- Como Prisma é usado?

### 3. Tour do Banco

Objetivo:

- Entender entidades e fluxos de dados.

Pontos:

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations`
- `backend/prisma/seed.js`

Entidades:

- `Asset`
- `Telemetry`
- `Alarm`
- `WorkOrder`
- `User`
- `TelemetryRaw`
- `TelemetryProcessed`
- `AlarmEvent`

Perguntas respondidas:

- Quais tabelas sustentam o dashboard?
- Onde ficam dados reais de aquisição?
- Quais tabelas são legadas?

### 4. Tour dos Agentes

Objetivo:

- Entender a arquitetura FCX 6.0 para agentes.

Pontos:

- `fcx6/agent-skills`
- `fcx6/ai-command-center`
- `fcx6/agent-orchestration`

Perguntas respondidas:

- Quais agentes existem?
- Quais skills foram definidas?
- Como o Master Agent coordena especialistas?
- Onde entra LangGraph?

### 5. Tour das Integrações

Objetivo:

- Entender integrações industriais e externas.

Pontos:

- `backend/src/modules/integrations`
- `backend/src/modules/acquisition`
- `fcx6/integration-hub`

Integrações:

- MQTT/EMQX.
- Modbus TCP.
- Carel BOSS.
- Sitrad Pro.
- ThingsBoard.
- FCX Gateway.
- GitHub.
- Google Drive.
- Gmail.
- Microsoft 365.
- WhatsApp.
- CRM.
- ERP.

Perguntas respondidas:

- Quais conectores existem hoje?
- O que será centralizado pelo Nango?
- Onde há duplicidade de ingestão?

### 6. Tour dos Dashboards

Objetivo:

- Entender dashboards operacionais e observabilidade.

Pontos:

- `backend/src/modules/dashboards`
- `grafana/dashboards`
- `grafana/provisioning`
- `observability/prometheus`
- `observability/loki`
- `observability/alertmanager`

Perguntas respondidas:

- Quais KPIs aparecem no dashboard?
- Quais métricas o Prometheus coleta?
- Quais alertas existem?
- Onde logs são consultados?

### 7. Tour do Knowledge Vault

Objetivo:

- Entender a arquitetura futura de RAG.

Pontos:

- `fcx6/knowledge-intelligence/README.md`
- `DOCUMENT_PIPELINE.md`
- `RAG_ARCHITECTURE.md`
- `VECTOR_DATABASE_PLAN.md`
- `SOURCES.md`

Perguntas respondidas:

- Quais fontes serão ingeridas?
- Como documentos viram chunks?
- Qual banco vetorial está planejado?
- Como agentes consultarão conhecimento?

## Formato futuro de tour

```json
{
  "tourId": "backend-overview",
  "title": "Backend Overview",
  "audience": "developer",
  "steps": [
    {
      "title": "App Module",
      "path": "backend/src/app.module.ts",
      "description": "Modulo raiz do NestJS.",
      "risks": ["Import order", "Module dependencies"]
    }
  ]
}
```

## Não implementar ainda

- UI de tours.
- Gerador automático.
- Scanner de arquivos.
- Integração com agente.
