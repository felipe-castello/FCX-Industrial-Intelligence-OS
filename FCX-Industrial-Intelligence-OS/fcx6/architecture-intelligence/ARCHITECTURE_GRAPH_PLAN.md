# Architecture Graph Plan - FCX Architecture Intelligence

## Objetivo

Criar um plano para representar a arquitetura do FCX como um grafo vivo, permitindo navegação, análise de impacto, documentação automática e entendimento contextual por humanos e agentes.

## Inspiração

Inspirado na ideia de "Understand Anything": transformar código, documentação, infraestrutura, dados e fluxos em um mapa navegável e consultável.

## Escopo inicial

Mapear:

1. Frontend.
2. Backend.
3. Banco.
4. Agentes.
5. Integrações.
6. Dashboards.
7. Knowledge Vault.

## Conceito de grafo

```text
Module
  |
  |-- owns --> File
  |-- exposes --> API Route
  |-- reads --> Database Table
  |-- writes --> Database Table
  |-- calls --> External Integration
  |-- feeds --> Dashboard
  |-- used_by --> Agent
  |-- documented_by --> Document
```

## Tipos de nós

### Frontend

- Página.
- Componente.
- Rota.
- API call.
- Estado local.
- Asset visual.

### Backend

- Módulo NestJS.
- Controller.
- Service.
- DTO futuro.
- Middleware.
- Health check.
- Metrics endpoint.

### Banco

- Entidade Prisma.
- Tabela.
- Enum.
- Índice.
- Migration.
- Relação.

### Agentes

- Agent definition.
- Skill.
- Ferramenta MCP.
- Fluxo LangGraph.
- Estado.
- Memória.

### Integrações

- Conector.
- Provedor externo.
- Credencial.
- Sync job.
- Webhook.
- Protocolo industrial.

### Dashboards

- Dashboard FCX frontend.
- Dashboard Grafana.
- Métrica.
- Alerta.
- Fonte de dados.

### Knowledge Vault

- Documento.
- Chunk.
- Fonte.
- Embedding.
- Índice.
- Citação.

## Tipos de arestas

- `imports`
- `depends_on`
- `exposes`
- `queries`
- `mutates`
- `publishes`
- `subscribes`
- `renders`
- `observes`
- `documents`
- `triggers`
- `validates`
- `uses_tool`
- `generates`

## Fontes do grafo

- Código fonte.
- Prisma schema.
- Controllers NestJS.
- Frontend routes.
- Docker Compose.
- Grafana dashboards.
- Prometheus rules.
- Documentação Markdown.
- Agent Skills.
- Planos FCX 6.0.

## Modelo conceitual

### ArchitectureNode

- `id`
- `type`
- `name`
- `path`
- `description`
- `owner`
- `tags`
- `riskLevel`
- `lastUpdated`

### ArchitectureEdge

- `sourceId`
- `targetId`
- `type`
- `description`
- `confidence`
- `detectedBy`

### ArchitectureFinding

- `id`
- `nodeId`
- `severity`
- `title`
- `description`
- `recommendation`

## Casos de uso

- "Mostre tudo que depende de Telemetry."
- "Qual impacto de mudar `/dashboards`?"
- "Quais agentes usam Knowledge Vault?"
- "Quais tabelas alimentam o dashboard executivo?"
- "Quais integrações têm risco alto?"
- "Quais módulos não têm documentação?"

## Saída esperada no futuro

- Grafo visual.
- Relatórios de impacto.
- Tours guiados.
- Documentação viva por módulo.
- Alertas de arquitetura.
- Perguntas e respostas sobre o sistema.

## Não implementar ainda

- Parser de código.
- Banco de grafo.
- UI visual.
- Ingestão automática.
- Agente de arquitetura executável.
