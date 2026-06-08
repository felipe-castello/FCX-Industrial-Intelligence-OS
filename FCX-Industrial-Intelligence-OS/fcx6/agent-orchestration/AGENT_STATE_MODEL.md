# Agent State Model

## Objetivo

Definir o modelo de estado compartilhado entre o FCX Master Agent, agentes especialistas, validação e memória.

## Estado conceitual

```json
{
  "conversationId": "string",
  "tenantId": "string",
  "userId": "string",
  "userRole": "string",
  "userGoal": "string",
  "intent": "string",
  "domain": "string",
  "riskLevel": "low|medium|high|critical",
  "plan": [],
  "selectedAgents": [],
  "toolPermissions": [],
  "evidence": [],
  "agentOutputs": [],
  "validation": {},
  "finalResponse": {},
  "memoryWrites": [],
  "errors": []
}
```

## Campos principais

### Identidade

- `conversationId`
- `sessionId`
- `tenantId`
- `userId`
- `userRole`
- `permissions`

Uso:

- Isolamento.
- Auditoria.
- Controle de acesso.

### Objetivo

- `userGoal`
- `normalizedGoal`
- `intent`
- `domain`
- `urgency`
- `scope`

Uso:

- Planejamento.
- Escolha de agente.
- Validação final.

### Plano

- `plan`
- `subtasks`
- `requiredEvidence`
- `successCriteria`
- `assumptions`

Uso:

- Guiar execução.
- Reduzir respostas improvisadas.
- Permitir replanejamento.

### Agentes

- `selectedAgents`
- `agentRoles`
- `agentConstraints`
- `handoffs`

Uso:

- Coordenar especialistas.
- Registrar responsabilidade de cada saída.

### Ferramentas

- `toolPermissions`
- `toolCalls`
- `toolResults`
- `toolErrors`

Uso:

- Rastrear uso de MCP Tools.
- Detectar falhas.
- Auditar dados acessados.

### Evidências

- `evidence`
- `sources`
- `citations`
- `dataQuality`
- `timeWindow`

Uso:

- Fundamentar resposta.
- Validar conclusões.
- Declarar incertezas.

### Validação

- `validation.status`
- `validation.findings`
- `validation.missingData`
- `validation.risks`
- `validation.requiresHumanApproval`

Status possíveis:

- `valid`
- `needs_more_data`
- `needs_human_approval`
- `invalid_result`
- `out_of_scope`

### Resposta final

- `finalResponse.summary`
- `finalResponse.analysis`
- `finalResponse.recommendations`
- `finalResponse.risks`
- `finalResponse.nextSteps`
- `finalResponse.sources`

Uso:

- Entrega ao usuário.
- Registro em memória.

### Memória

- `memoryWrites`
- `memoryType`
- `memoryScope`
- `retentionPolicy`

Tipos:

- `session`
- `asset`
- `tenant`
- `decision`
- `feedback`

## Modelo de evidência

```json
{
  "id": "string",
  "type": "telemetry|alarm|document|work_order|user_input|model_output",
  "source": "string",
  "timestamp": "string",
  "confidence": 0.0,
  "summary": "string",
  "reference": "string"
}
```

## Modelo de saída de agente

```json
{
  "agentId": "string",
  "task": "string",
  "status": "success|partial|failed",
  "summary": "string",
  "evidenceIds": [],
  "recommendations": [],
  "risks": [],
  "confidence": 0.0
}
```

## Modelo de chamada de ferramenta

```json
{
  "toolName": "string",
  "agentId": "string",
  "inputSummary": "string",
  "status": "success|failed|blocked",
  "durationMs": 0,
  "resultSummary": "string",
  "error": "string"
}
```

## Regras de estado

- Nunca armazenar secrets.
- Sempre incluir `tenantId`.
- Dados sensíveis devem ser resumidos quando possível.
- Evidências devem ser referenciáveis.
- Saídas de agentes devem indicar confiança.
- Estado de Labs deve ser separado do core industrial.

## Persistência futura

Camadas possíveis:

- Redis para estado temporário.
- PostgreSQL para auditoria.
- Vector store para memória semântica futura.
- Object storage para anexos e evidências grandes.

## Não implementar ainda

- Tabelas de estado.
- Persistência real.
- Serialização LangGraph.
- Memory store.
