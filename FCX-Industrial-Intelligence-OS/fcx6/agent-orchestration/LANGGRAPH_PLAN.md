# LangGraph Plan - FCX Agent Orchestration

## Objetivo

Definir a camada de orquestração de agentes do FCX 6.0 usando LangGraph, permitindo que o FCX Master Agent coordene agentes especialistas com estado, validação, rastreabilidade e memória.

## Fluxo obrigatório

```text
Objetivo do usuário
  ↓
Planejamento
  ↓
Escolha de agentes
  ↓
Execução
  ↓
Validação
  ↓
Resposta final
  ↓
Registro em memória
```

## Papel do LangGraph

LangGraph será usado para modelar fluxos de decisão e execução multiagente como grafos controlados.

Responsabilidades:

- Representar estados da tarefa.
- Definir nós de planejamento, execução, validação e resposta.
- Controlar handoff entre agentes.
- Permitir human-in-the-loop.
- Persistir estado de conversas e investigações.
- Evitar execuções descontroladas.

## Agentes coordenados

- FCX Master Agent.
- FCX Technical Knowledge Vault Agent.
- FCX Industrial Intelligence Agent.
- FCX Electronics Lab Agent.
- FCX Field Service Agent.
- FCX Sports Quant Agent.
- FCX Trade Intelligence Agent.

## Grafo conceitual

```text
Start
  |
  v
UserGoalNode
  |
  v
PlanningNode
  |
  v
AgentSelectionNode
  |
  v
ExecutionNode
  |
  v
ValidationNode
  |
  +-- needs_more_data --> PlanningNode
  +-- needs_human_approval --> HumanApprovalNode
  +-- invalid_result --> ExecutionNode
  +-- valid_result --> FinalResponseNode
  |
  v
MemoryWriteNode
  |
  v
End
```

## Nós previstos

### UserGoalNode

Função:

- Receber objetivo do usuário.
- Identificar intenção, escopo, urgência e domínio.
- Capturar contexto de tenant, usuário e permissões.

### PlanningNode

Função:

- Quebrar objetivo em subtarefas.
- Definir evidências necessárias.
- Identificar riscos.
- Definir se a tarefa é leitura, recomendação ou ação.

### AgentSelectionNode

Função:

- Escolher agentes especialistas.
- Definir ordem de execução.
- Definir ferramentas permitidas por agente.
- Validar permissões.

### ExecutionNode

Função:

- Executar agentes especialistas.
- Chamar MCP Tools autorizadas.
- Coletar evidências.
- Consolidar resultados parciais.

### ValidationNode

Função:

- Validar completude.
- Checar fontes.
- Verificar consistência técnica.
- Detectar risco operacional.
- Determinar se precisa de mais dados ou aprovação humana.

### HumanApprovalNode

Função:

- Pausar fluxo para aprovação humana.
- Apresentar decisão proposta.
- Registrar aprovador, data e justificativa.

### FinalResponseNode

Função:

- Produzir resposta final.
- Explicar raciocínio em nível adequado.
- Citar evidências.
- Declarar incertezas.

### MemoryWriteNode

Função:

- Registrar interação.
- Salvar resumo, agentes usados, ferramentas, fontes e decisão.
- Atualizar memória operacional quando permitido.

## Tipos de fluxo

### Fluxo informativo

Usado para perguntas simples.

Exemplo:

- "Qual é o status dos ativos críticos?"

Agentes comuns:

- Master Agent.
- Industrial Intelligence Agent.

### Fluxo técnico

Usado para diagnóstico técnico.

Exemplo:

- "Por que o compressor X está com vibração alta?"

Agentes comuns:

- Industrial Intelligence Agent.
- Technical Knowledge Vault Agent.
- Field Service Agent.

### Fluxo de campo

Usado para preparar atendimento.

Exemplo:

- "Prepare uma OS para o ativo X."

Agentes comuns:

- Field Service Agent.
- Knowledge Vault Agent.
- Industrial Intelligence Agent.

### Fluxo Labs

Usado para Sports Quant ou Trade Intelligence.

Regra:

- Deve ser isolado do contexto industrial.
- Não deve acessar dados industriais sem permissão explícita.

## Regras de roteamento

- Diagnóstico industrial: Industrial Intelligence Agent.
- Procedimento técnico: Technical Knowledge Vault Agent.
- Eletrônica, gateway ou sensores: Electronics Lab Agent.
- Ordem de serviço: Field Service Agent.
- Esportes quantitativos: Sports Quant Agent.
- Mercado e risco financeiro: Trade Intelligence Agent.
- Tarefas mistas: Master Agent coordena múltiplos especialistas.

## Memória

Tipos:

- Memória de sessão.
- Memória de investigação.
- Memória do ativo.
- Memória de decisão.
- Memória de feedback.

Cuidados:

- Memória sempre isolada por tenant.
- Dados sensíveis devem ser resumidos ou mascarados.
- Decisões críticas precisam de trilha de auditoria.

## Segurança

- Todo fluxo recebe `tenantId`, `userId`, `role` e permissões.
- Ferramentas são filtradas antes da execução.
- Agentes Labs ficam separados do core industrial.
- Ações de escrita exigem aprovação humana.
- Secrets nunca entram no estado do grafo.

## Observabilidade

Métricas previstas:

- Execuções por agente.
- Tempo por nó.
- Falhas por ferramenta.
- Validações rejeitadas.
- Aprovações humanas.
- Custo estimado por fluxo.
- Feedback por resposta.

## Não implementar ainda

- Runtime LangGraph.
- Persistência real de estado.
- MCP Tools executáveis.
- Integração com LibreChat.
- Execução autônoma.
