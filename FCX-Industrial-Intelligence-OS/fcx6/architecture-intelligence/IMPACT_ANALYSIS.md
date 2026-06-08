# Impact Analysis - FCX Architecture Intelligence

## Objetivo

Definir como analisar impacto de mudanças no FCX antes de alterar código, banco, integrações, agentes ou dashboards.

## Pergunta central

```text
Se este componente mudar, o que pode quebrar?
```

## Áreas mapeadas

1. Frontend.
2. Backend.
3. Banco.
4. Agentes.
5. Integrações.
6. Dashboards.
7. Knowledge Vault.

## Processo de análise

### 1. Identificar componente alterado

Exemplos:

- Rota frontend.
- Endpoint backend.
- Service NestJS.
- Tabela Prisma.
- Tópico MQTT.
- Dashboard Grafana.
- Skill de agente.
- Fonte documental.

### 2. Mapear dependentes diretos

Perguntas:

- Quem importa?
- Quem chama?
- Quem lê?
- Quem escreve?
- Quem renderiza?
- Quem observa?
- Quem documenta?

### 3. Mapear dependentes indiretos

Perguntas:

- Algum dashboard usa esse dado?
- Algum agente depende desse endpoint?
- Alguma integração publica nesse tópico?
- Algum alerta Prometheus depende dessa métrica?
- Algum documento ou skill referencia esse módulo?

### 4. Classificar risco

| Risco | Critério |
|---|---|
| Baixo | Mudança isolada e documentada |
| Médio | Afeta um módulo ou tela |
| Alto | Afeta API, banco, dashboards ou integração |
| Crítico | Afeta produção, dados, segurança ou multi-tenant |

### 5. Definir plano de mitigação

- Teste necessário.
- Feature flag.
- Migração.
- Compatibilidade temporária.
- Rollback.
- Comunicação.
- Monitoramento.

## Matrizes de impacto

### Frontend

Mudanças comuns:

- Alterar rota.
- Alterar API call.
- Alterar formato esperado de dados.
- Alterar layout de dashboard.

Pode impactar:

- Experiência do usuário.
- Nginx SPA fallback.
- Contratos de API.
- Documentação.
- Tours guiados.

### Backend

Mudanças comuns:

- Alterar controller.
- Alterar service.
- Alterar middleware de segurança.
- Alterar endpoint `/health` ou `/metrics`.

Pode impactar:

- Frontend.
- Prometheus.
- Agentes.
- MCP Tools.
- Integrações.
- Scripts de healthcheck.

### Banco

Mudanças comuns:

- Alterar Prisma schema.
- Remover campo.
- Renomear tabela.
- Criar migration.

Pode impactar:

- Backend services.
- Seed.
- Dashboards.
- Preditivo.
- Knowledge Vault futuro.
- Relatórios.

### Agentes

Mudanças comuns:

- Alterar skill.
- Alterar MCP Tool.
- Alterar fluxo LangGraph.
- Alterar política de validação.

Pode impactar:

- AI Command Center.
- Auditoria.
- Segurança.
- Decisões operacionais.
- Memória.

### Integrações

Mudanças comuns:

- Alterar conector.
- Alterar payload.
- Alterar OAuth scope.
- Alterar sync job.

Pode impactar:

- Dados externos.
- Knowledge Vault.
- Communication Intelligence.
- Agentes.
- Compliance.

### Dashboards

Mudanças comuns:

- Alterar métrica.
- Alterar datasource.
- Alterar alerta.
- Alterar painel.

Pode impactar:

- Operação.
- SRE.
- Go-live.
- Cliente.
- Confiança nos dados.

### Knowledge Vault

Mudanças comuns:

- Alterar chunking.
- Alterar embedding.
- Alterar banco vetorial.
- Alterar fonte.

Pode impactar:

- Respostas RAG.
- Citações.
- Agentes.
- Auditoria.
- Qualidade técnica.

## Checklist antes de mudar

- O contrato público muda?
- Existe consumidor conhecido?
- Existe teste ou validação?
- Existe rollback?
- Existe métrica ou alerta afetado?
- Existe documentação afetada?
- Existe risco multi-tenant?
- Existe risco de segurança?

## Saída esperada

Um relatório de impacto deve conter:

- Componente alterado.
- Dependentes diretos.
- Dependentes indiretos.
- Risco.
- Plano de teste.
- Plano de rollback.
- Aprovação necessária.

## Não implementar ainda

- Motor automático de análise.
- Grafo persistido.
- Scanner de dependências.
- UI de impacto.
