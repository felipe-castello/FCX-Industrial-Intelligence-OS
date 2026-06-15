# Feedback Loop - FCX Decision Intelligence

## Objetivo

Definir como o FCX aprende com decisões tomadas, recomendações aceitas ou rejeitadas e resultados observados.

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

## Tipos de feedback

### Feedback explícito

Fornecido por usuário.

Exemplos:

- Recomendação útil.
- Recomendação incorreta.
- Diagnóstico confirmado.
- Diagnóstico rejeitado.
- Ação executada.

### Feedback implícito

Derivado de eventos posteriores.

Exemplos:

- Falha ocorreu após alerta.
- OS foi aberta.
- OS resolveu problema.
- Consumo reduziu.
- Lead converteu.
- Modelo errou resultado.

### Feedback operacional

Relacionado a execução.

Exemplos:

- Técnico confirmou causa.
- Peça foi substituída.
- Alarme desapareceu.
- Ativo voltou ao normal.

### Feedback financeiro

Relacionado a custo, receita ou economia.

Exemplos:

- Economia realizada.
- Custo evitado.
- Proposta fechada.
- Risco financeiro evitado.

## Registro de decisão

Cada decisão deve registrar:

- `decisionId`
- `domain`
- `timestamp`
- `scannerSignal`
- `probability`
- `edge`
- `riskScore`
- `recommendation`
- `humanDecision`
- `executedAction`
- `expectedOutcome`
- `observedOutcome`
- `feedback`

## Janela de avaliação

Definir por domínio:

| Domínio | Janela sugerida |
|---|---|
| Industrial falha crítica | 24h a 7 dias |
| Manutenção preventiva | 7 a 30 dias |
| Energia | 7 a 60 dias |
| Field Service | Até fechamento da OS |
| Lead | 7 a 90 dias |
| Sports Quant | Após evento |
| Trade Intelligence | Conforme tese |

## Métricas de aprendizado

- Taxa de recomendação aceita.
- Taxa de recomendação rejeitada.
- Acurácia de probabilidade.
- Edge previsto versus realizado.
- Risco previsto versus ocorrido.
- Economia prevista versus realizada.
- Tempo até feedback.
- Motivos de rejeição.

## Uso do feedback

Feedback deve alimentar:

- Ajuste de thresholds.
- Priorização de risco.
- Melhoria de prompts.
- Melhoria de modelos.
- Qualidade de dados.
- Treinamento futuro.
- Relatórios de confiança.

## Ciclo de melhoria

```text
Decisão registrada
  |
  v
Resultado observado
  |
  v
Comparação esperado x real
  |
  v
Classificação do erro ou acerto
  |
  v
Ajuste de regra/modelo
  |
  v
Nova versão de política
```

## Governança

- Não ajustar modelo automaticamente sem revisão.
- Separar feedback por tenant.
- Versionar políticas de decisão.
- Registrar mudanças de threshold.
- Manter histórico de decisões.

## Riscos

- Feedback enviesado.
- Dados insuficientes.
- Confundir correlação com causalidade.
- Otimizar para métrica errada.
- Usar feedback de um tenant em outro sem governança.

## Não implementar ainda

- Treinamento automático.
- Atualização automática de modelo.
- Tabelas reais.
- UI de feedback.
