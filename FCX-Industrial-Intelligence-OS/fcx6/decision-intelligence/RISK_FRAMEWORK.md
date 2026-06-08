# Risk Framework - FCX Decision Intelligence

## Objetivo

Definir um framework de risco para decisões do FCX 6.0 em domínios industriais, energia, field service, Sports Quant e Trade Intelligence.

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

## Tipos de risco

### Risco operacional

Impacto em operação, disponibilidade, SLA, perda de produto ou manutenção.

Exemplos:

- Câmara fria fora de temperatura.
- Compressor com vibração alta.
- Sensor crítico sem comunicação.

### Risco de segurança

Impacto em pessoas, elétrica, mecânica ou ambiente.

Exemplos:

- Intervenção NR10.
- Equipamento sob carga.
- Procedimento sem técnico habilitado.

### Risco financeiro

Impacto em custo, receita, consumo energético, multa ou contrato.

Exemplos:

- Consumo energético elevado.
- Estoque parado.
- Cliente em risco de churn.

### Risco de dados

Impacto causado por dados incompletos, atrasados, simulados ou inconsistentes.

Exemplos:

- Telemetria antiga.
- Sensor descalibrado.
- Histórico insuficiente.

### Risco regulatório

Impacto jurídico, normativo ou compliance.

Exemplos:

- NR10.
- PMOC.
- Dados pessoais.
- Trade Intelligence.

### Risco de modelo

Impacto de previsão incorreta, overfitting, baixa confiança ou modelo desatualizado.

## Escala de risco

| Score | Nível | Interpretação |
|---:|---|---|
| 0-20 | Baixo | Pode seguir com monitoramento |
| 21-45 | Moderado | Requer atenção |
| 46-70 | Alto | Requer revisão humana |
| 71-100 | Crítico | Escalonamento obrigatório |

## Componentes do risco

```text
Risk Score =
  Impacto
  × Probabilidade de dano
  × Exposição
  × Incerteza dos dados
  × Criticidade
```

## Matriz probabilidade x impacto

| Impacto / Probabilidade | Baixa | Média | Alta |
|---|---|---|---|
| Baixo | Baixo | Baixo | Moderado |
| Médio | Baixo | Moderado | Alto |
| Alto | Moderado | Alto | Crítico |

## Regras por domínio

### Industrial

Risco aumenta com:

- Ativo crítico.
- Alarme crítico ativo.
- Tendência de falha.
- Telemetria fora de faixa.
- Histórico recorrente.

### Energy Intelligence

Risco aumenta com:

- Consumo acima do baseline.
- Impacto financeiro alto.
- Desvio persistente.
- Baixa capacidade de ação.

### Field Service

Risco aumenta com:

- SLA próximo.
- Ativo crítico.
- Falta de peça.
- Técnico sem informação.
- Recorrência de OS.

### Sports Quant

Risco aumenta com:

- Baixo volume de dados.
- Odds voláteis.
- Modelo sem backtest.
- Edge pequeno.
- Alta exposição.

### Trade Intelligence

Risco aumenta com:

- Volatilidade.
- Alavancagem.
- Falta de tese clara.
- Evento macro.
- Risco regulatório.

## Política de aprovação

Exigir aprovação humana quando:

- Risco >= 46.
- Ação gera custo.
- Ação altera operação.
- Ação afeta segurança.
- Ação escreve em sistema externo.
- Domínio é financeiro ou regulado.

## Saída esperada

```json
{
  "riskScore": 64,
  "riskLevel": "high",
  "riskDrivers": [
    "critical_asset",
    "active_alarm",
    "data_uncertainty"
  ],
  "requiresHumanApproval": true
}
```

## Cuidados

- Não usar score de risco como verdade absoluta.
- Sempre mostrar fatores que compõem o risco.
- Separar risco técnico de risco financeiro.
- Declarar incerteza.
- Registrar resultado observado.
