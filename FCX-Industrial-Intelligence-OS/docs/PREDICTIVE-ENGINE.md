# FCX Predictive Intelligence Engine

## Modulos

- Energy Analytics
- Vibration Analytics
- Temperature Analytics
- Asset Health Score
- Alarm Correlation Engine

## Modelos iniciais

- Regressao: usada para previsao de temperatura e consumo energetico.
- Random Forest: ensemble heuristico para risco de falha a partir de votos de variaveis criticas.
- XGBoost: score ponderado para risco de falha combinando telemetria, alarmes e Health Score.
- Isolation Forest: score de anomalia por desvio multivariavel contra baseline recente.

## Endpoints

```http
GET /predictive/health
GET /predictive/failure
GET /predictive/anomaly
GET /predictive/anomalies
GET /predictive/forecast
GET /predictive/dashboard
```

Todos os endpoints aceitam `assetId` opcional, exceto `/predictive/dashboard`.

Exemplo:

```http
GET /predictive/health?assetId=uuid-do-ativo
```

## Health Score

O Health Score varia de 0 a 100.

Pontuacao inicial:

```text
100
```

Penalidades consideradas:

- temperatura media acima de 24 C
- vibracao media acima de 2 mm/s
- consumo energetico medio acima de 45 kW
- correlacao de alarmes ativos e criticos
- status do ativo, como `ALARM`, `OFFLINE` ou `MAINTENANCE`
- criticidade do ativo
- tendencia de falha por vibracao

Classificacao:

- `healthy`: 82 a 100
- `monitored`: 65 a 81
- `attention`: 40 a 64
- `critical`: 0 a 39

## Tendencia de falha

A tendencia de falha usa a inclinacao das ultimas leituras de vibracao.

Estados:

- `stable`
- `attention`
- `failure-trend`

## Deteccao de anomalias

Anomalias iniciais:

- Temperatura acima de 35 C ou acima da media historica recente.
- Vibracao acima de 6 mm/s ou acima da media historica recente.
- Potencia acima de 35% do consumo medio recente.
- Score Isolation Forest acima de 60.

## Previsoes

As previsoes usam regressao simples nas leituras recentes.

Previsoes geradas:

- temperatura prevista
- consumo energetico previsto

Horizonte padrao:

```text
12 horas
```

## Dashboard executivo

Rota frontend:

```text
http://localhost:5173/predictive
```

Widgets:

- Health Score por ativo
- Risco de Falha
- Top 10 ativos criticos
- Tendencia de falhas
- Consumo previsto
- Temperatura prevista
- Anomalias detectadas

## Dados simulados

O seed do Prisma gera dados normais e tambem padroes de degradacao nos primeiros ativos para demonstrar:

- aumento gradual de temperatura
- aumento gradual de vibracao
- crescimento de consumo energetico
- anomalias operacionais
- tendencia de falha
