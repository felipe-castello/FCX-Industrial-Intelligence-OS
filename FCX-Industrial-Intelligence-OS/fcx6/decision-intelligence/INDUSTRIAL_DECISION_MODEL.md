# Industrial Decision Model - FCX Decision Intelligence

## Objetivo

Planejar o modelo de decisão industrial do FCX 6.0 para apoiar manutenção, energia, alarmes, field service e gestão operacional.

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

## Scanner industrial

Objetivo:

- Detectar situações que exigem decisão.

Sinais:

- Alarme crítico.
- Temperatura fora de faixa.
- Vibração crescente.
- Consumo energético anômalo.
- Pressão anormal.
- Ativo offline.
- OS recorrente.
- Health Score baixo.

Fontes:

- `telemetry`
- `telemetry_processed`
- `alarms`
- `alarm_events`
- `work_orders`
- `assets`
- Knowledge Vault futuro.

## Probabilidade

Objetivo:

- Estimar chance de falha, reincidência, economia ou agravamento.

Exemplos:

- Probabilidade de falha em 7 dias.
- Probabilidade de alarme recorrente.
- Probabilidade de economia após ajuste.
- Probabilidade de OS resolver problema.

Inputs:

- Tendência de telemetria.
- Histórico do ativo.
- Criticidade.
- Alarmes.
- Ordens anteriores.
- Baseline energético.

## Edge industrial

Objetivo:

- Medir vantagem esperada de agir agora versus esperar.

Exemplos:

- Redução de risco.
- Economia estimada.
- SLA preservado.
- Custo evitado.
- Menor chance de parada.

Fórmula conceitual:

```text
edge = beneficio_esperado - custo_acao - custo_risco_residual
```

## Risco

Fatores:

- Criticidade do ativo.
- Severidade do alarme.
- Impacto operacional.
- Segurança.
- Incerteza dos dados.
- Custo de intervenção.
- SLA.

Classificação:

- Baixo.
- Moderado.
- Alto.
- Crítico.

## Decisão

Tipos de decisão:

- Monitorar.
- Solicitar mais dados.
- Gerar rascunho de OS.
- Escalonar para técnico.
- Recomendar inspeção.
- Recomendar ajuste operacional.
- Abrir incidente.
- Não agir.

Regras:

- Escrita deve ser rascunho por padrão.
- Intervenção crítica exige aprovação humana.
- Decisão deve citar evidências.
- Decisão deve declarar confiança.

## Feedback

Coletar:

- OS foi aberta?
- Técnico confirmou causa?
- Ativo normalizou?
- Alarme voltou?
- Consumo reduziu?
- Falha ocorreu?
- Cliente aceitou recomendação?

Métricas:

- Precisão de recomendação.
- Falhas evitadas.
- Tempo de resposta.
- Reincidência.
- Economia estimada versus realizada.
- Redução de risco.

## Exemplo de saída

```json
{
  "assetId": "asset-123",
  "scannerSignal": "vibration_trend",
  "probability": {
    "failureIn7Days": 0.68
  },
  "edge": {
    "riskReduction": 0.42,
    "expectedBenefit": "high"
  },
  "risk": {
    "score": 74,
    "level": "critical",
    "drivers": ["critical_asset", "vibration_growth", "active_alarm"]
  },
  "decision": {
    "recommendation": "create_work_order_draft",
    "requiresHumanApproval": true
  },
  "feedbackRequired": true
}
```

## Políticas por severidade

### Baixa

- Monitorar.
- Registrar observação.

### Moderada

- Investigar.
- Recomendar verificação.

### Alta

- Criar rascunho de OS.
- Notificar responsável.

### Crítica

- Escalonar.
- Exigir aprovação humana.
- Registrar decisão.

## Riscos e cuidados

- Não confundir sensor ruim com falha real.
- Não agir com telemetria antiga.
- Não recomendar parada sem validação humana.
- Não misturar dados simulados com reais.
- Não usar recomendação sem explicação.

## Não implementar ainda

- Modelo probabilístico real.
- Criação automática de OS.
- Execução de ações.
- UI de aprovação.
- Feedback automático.
