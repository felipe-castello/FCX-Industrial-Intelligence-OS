# Decision Engine Plan - FCX Decision Intelligence

## Objetivo

Planejar o motor de decisão do FCX 6.0, inspirado em abordagens como TradingAgents e QuantDinger, mas adaptado ao contexto FCX: indústria, energia, manutenção, atendimento, Sports Quant e Trade Intelligence.

## Fluxo obrigatório

```text
Scanner
  ↓
Probabilidade
  ↓
Edge
  ↓
Risco
  ↓
Decisão
  ↓
Feedback
```

## Princípio central

O motor deve apoiar decisão, não executar ações críticas automaticamente.

Decisões sensíveis exigem:

- Evidência.
- Explicação.
- Registro.
- Aprovação humana.
- Feedback posterior.

## Conceitos

### Scanner

Identifica oportunidades, riscos, anomalias ou situações que exigem decisão.

Exemplos:

- Ativo com vibração crescente.
- Consumo energético fora do baseline.
- Alarme crítico recorrente.
- Lead com alto potencial.
- Evento esportivo com desalinhamento estatístico.
- Tese de mercado com relação risco/retorno interessante.

### Probabilidade

Estima a chance de um evento ocorrer.

Exemplos:

- Probabilidade de falha.
- Probabilidade de economia.
- Probabilidade de conversão.
- Probabilidade de resultado esportivo.
- Probabilidade de cenário de mercado.

### Edge

Representa vantagem estimada em relação ao baseline, custo, odds, risco ou alternativa.

Exemplos:

- Redução esperada de falha.
- Economia estimada.
- Ganho de SLA.
- Valor esperado positivo.
- Desvio entre modelo e mercado.

### Risco

Mede impacto negativo potencial.

Exemplos:

- Parada operacional.
- Perda de produto.
- Custo de manutenção.
- Exposição financeira.
- Risco regulatório.
- Baixa confiança do modelo.

### Decisão

Recomendação ou ação proposta.

Tipos:

- Monitorar.
- Investigar.
- Abrir rascunho de OS.
- Escalonar.
- Otimizar energia.
- Rejeitar oportunidade.
- Registrar tese.

### Feedback

Resultado observado após decisão.

Exemplos:

- Falha ocorreu ou não.
- Economia foi realizada.
- OS resolveu o problema.
- Lead converteu.
- Modelo acertou ou errou.
- Risco materializou.

## Arquitetura conceitual

```text
Data Sources
  |
  v
Scanner Engine
  |
  v
Probability Engine
  |
  v
Edge Calculator
  |
  v
Risk Engine
  |
  v
Decision Policy
  |
  v
Human Approval
  |
  v
Decision Registry
  |
  v
Feedback Loop
```

## Domínios suportados

### Industrial

- Ativos.
- Telemetria.
- Alarmes.
- Ordens de serviço.
- Energy Intelligence.
- Field Service.

### Sports Quant

- Eventos esportivos.
- Probabilidades.
- Odds.
- Backtesting.
- Edge.
- Gestão de banca simulada.

### Trade Intelligence

- Teses.
- Sinais.
- Risco.
- Cenários.
- Registro de decisão.

Observação:

- Trade Intelligence deve permanecer separado de execução financeira real.

## Saída esperada do motor

```json
{
  "decisionId": "string",
  "domain": "industrial",
  "scannerSignal": {},
  "probability": 0.72,
  "edge": 0.18,
  "riskScore": 64,
  "recommendation": "open_work_order_draft",
  "confidence": 0.81,
  "requiresHumanApproval": true,
  "evidence": [],
  "explanation": "string"
}
```

## Política de decisão

Exemplo conceitual:

| Probabilidade | Edge | Risco | Decisão |
|---|---:|---:|---|
| Alta | Alto | Baixo | Recomendar ação |
| Alta | Alto | Alto | Escalonar com aprovação |
| Média | Médio | Baixo | Monitorar ou investigar |
| Baixa | Alto | Alto | Rejeitar ou pedir mais dados |
| Incerta | Qualquer | Qualquer | Coletar mais evidências |

## Auditoria

Registrar:

- Dados usados.
- Modelo usado.
- Versão.
- Probabilidade.
- Edge.
- Risco.
- Decisão.
- Aprovador.
- Resultado observado.
- Feedback.

## Não implementar ainda

- Modelos reais.
- Execução automática.
- Integração com odds ou mercado.
- Escrita em produção.
- UI de aprovação.
