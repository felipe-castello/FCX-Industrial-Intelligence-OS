# Sports Quant Model - FCX Decision Intelligence

## Objetivo

Planejar um modelo Sports Quant experimental baseado em scanner, probabilidade, edge, risco, decisão e feedback.

## Status

Este módulo pertence a FCX Labs e deve ficar isolado do core industrial.

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

## Scanner

Objetivo:

- Identificar eventos, mercados ou hipóteses com possível vantagem estatística.

Entradas:

- Calendário de eventos.
- Odds.
- Histórico de times ou atletas.
- Métricas de performance.
- Lesões, escalações ou contexto, se disponível.

Saída:

- Lista de oportunidades candidatas.

## Probabilidade

Objetivo:

- Estimar probabilidade real do evento.

Métodos futuros:

- Modelos estatísticos.
- Regressão.
- Rating.
- Ensemble.
- Backtesting.

Saída:

- Probabilidade estimada.
- Confiança.
- Features principais.

## Edge

Objetivo:

- Comparar probabilidade estimada com preço/odds de mercado.

Fórmula conceitual:

```text
edge = probabilidade_modelo - probabilidade_implícita
```

Saída:

- Edge absoluto.
- Edge relativo.
- Valor esperado.

## Risco

Fatores:

- Baixo volume de dados.
- Mercado volátil.
- Odds desatualizadas.
- Modelo sem validação.
- Evento com alta incerteza.
- Exposição acumulada.

Classificação:

- Baixo.
- Moderado.
- Alto.
- Crítico.

## Decisão

Tipos:

- Ignorar.
- Monitorar.
- Marcar como oportunidade.
- Simular entrada.
- Registrar tese.

Regra:

- O sistema não deve executar aposta.
- O sistema não deve prometer retorno.
- Toda saída deve declarar incerteza.

## Feedback

Dados:

- Resultado do evento.
- Probabilidade estimada.
- Odds consideradas.
- Edge estimado.
- Resultado simulado.
- Erro do modelo.

Métricas:

- Calibration.
- ROI simulado.
- Hit rate.
- Closing line value, se disponível.
- Drawdown simulado.

## Saída esperada

```json
{
  "eventId": "string",
  "market": "string",
  "modelProbability": 0.58,
  "impliedProbability": 0.52,
  "edge": 0.06,
  "riskLevel": "moderate",
  "decision": "simulate",
  "confidence": 0.7,
  "notes": "string"
}
```

## Riscos e cuidados

- Overfitting.
- Dados ruins.
- Odds atrasadas.
- Viés de seleção.
- Interpretação financeira indevida.
- Regulação.

## Não implementar ainda

- Coleta de odds.
- Backtesting real.
- Aposta.
- Execução financeira.
- UI.
