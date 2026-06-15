# fcx-quantdinger-adapter

Adapter FCX para `felipe-castello/QuantDinger`.

## Objetivo

Usar QuantDinger como motor quantitativo separado para FCX Sports Quant, FCX Polymarket e FCX Quant Intelligence.

## Regras

- Modo permitido: `research` ou `simulation`.
- Nunca executar ordens financeiras reais.
- Alto risco deve retornar `BLOCK`.

## Feature flag

`ENABLE_QUANTDINGER=false`
