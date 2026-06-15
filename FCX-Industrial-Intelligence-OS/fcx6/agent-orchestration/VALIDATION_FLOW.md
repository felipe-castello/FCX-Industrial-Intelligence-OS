# Validation Flow - FCX Agent Orchestration

## Objetivo

Definir como respostas e ações de agentes são validadas antes de chegar ao usuário ou serem registradas em memória.

## Posição no fluxo obrigatório

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

## Objetivos da validação

- Garantir que a resposta atende ao objetivo.
- Verificar evidências.
- Reduzir alucinação.
- Detectar riscos operacionais.
- Exigir aprovação humana quando necessário.
- Bloquear acesso indevido.
- Separar fatos, inferências e recomendações.

## Etapas de validação

### 1. Validação de escopo

Perguntas:

- A resposta está dentro do pedido do usuário?
- O agente usado é apropriado?
- O domínio está correto?
- A tarefa pertence ao core industrial ou Labs?

Resultados:

- Prosseguir.
- Replanejar.
- Encaminhar para outro agente.
- Bloquear como fora de escopo.

### 2. Validação de permissão

Perguntas:

- O usuário pode acessar esse tenant?
- O usuário pode acessar esse ativo, documento ou OS?
- A ferramenta chamada era permitida?
- Há dados sensíveis na resposta?

Resultados:

- Prosseguir.
- Mascarar dados.
- Bloquear resposta.
- Solicitar permissão.

### 3. Validação de evidência

Perguntas:

- Existem fontes suficientes?
- A telemetria é recente?
- A fonte documental foi citada?
- O histórico suporta a recomendação?
- Há conflito entre evidências?

Resultados:

- Validar.
- Marcar como baixa confiança.
- Pedir mais dados.
- Reexecutar agente.

### 4. Validação técnica

Perguntas:

- A recomendação faz sentido para o tipo de ativo?
- Unidades de medida foram respeitadas?
- O diagnóstico diferencia hipótese de fato?
- O procedimento técnico cita fonte?
- Existe risco de segurança física?

Resultados:

- Validar.
- Adicionar alerta.
- Exigir aprovação humana.
- Bloquear recomendação.

### 5. Validação operacional

Perguntas:

- A ação proposta impacta operação?
- Pode gerar parada?
- Pode afetar segurança elétrica ou mecânica?
- Pode criar custo ou SLA?
- Deve virar rascunho em vez de ação final?

Resultados:

- Permitir resposta.
- Criar rascunho.
- Exigir aprovação humana.
- Bloquear ação.

### 6. Validação de resposta

Checklist:

- Resumo claro.
- Evidências listadas.
- Recomendação objetiva.
- Riscos explicitados.
- Próximos passos.
- Incertezas declaradas.
- Fontes citadas quando aplicável.

## Status de validação

### `valid`

A resposta pode ser entregue ao usuário.

### `needs_more_data`

O fluxo deve voltar para planejamento ou execução.

### `needs_human_approval`

O fluxo deve pausar e solicitar aprovação.

### `invalid_result`

O resultado deve ser descartado ou reexecutado.

### `out_of_scope`

O usuário deve receber explicação de limitação ou redirecionamento.

## Critérios para aprovação humana

Exigir aprovação quando:

- Houver ação de escrita.
- Houver ordem de serviço final.
- Houver recomendação de intervenção crítica.
- Houver risco elétrico, mecânico ou de segurança.
- Houver impacto financeiro relevante.
- Houver dados insuficientes para decisão segura.
- Houver domínio Labs com implicação regulatória.

## Validação por tipo de agente

### Master Agent

- Verificar roteamento correto.
- Verificar se não respondeu fora da especialidade.

### Technical Knowledge Vault Agent

- Exigir fonte.
- Validar versão do documento.
- Declarar falta de evidência.

### Industrial Intelligence Agent

- Validar telemetria, alarmes e janela de tempo.
- Separar dados simulados de reais.
- Declarar confiança.

### Electronics Lab Agent

- Validar risco elétrico.
- Evitar instrução perigosa.
- Exigir contexto de bancada.

### Field Service Agent

- Criar rascunhos, não ações finais.
- Validar checklist e SLA.
- Destacar segurança.

### Sports Quant Agent

- Declarar incerteza estatística.
- Bloquear execução de aposta.
- Alertar sobre overfitting.

### Trade Intelligence Agent

- Bloquear execução financeira.
- Declarar risco e compliance.
- Registrar tese, não ordem.

## Saída da validação

Formato recomendado:

```json
{
  "status": "valid",
  "confidence": 0.82,
  "findings": [],
  "risks": [],
  "missingData": [],
  "requiresHumanApproval": false
}
```

## Registro

Todo fluxo de validação deve registrar:

- Status.
- Motivos.
- Evidências avaliadas.
- Riscos.
- Decisão de aprovação.
- Agente ou ferramenta reexecutada, se houver.

## Não implementar ainda

- Validador automático.
- Tabelas de auditoria.
- Human approval UI.
- Execução LangGraph.
