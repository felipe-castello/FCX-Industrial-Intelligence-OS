# QuantDinger

Modulo externo previsto: `felipe-castello/QuantDinger`.

## Funcao no FCX

Motor quantitativo separado para:

- FCX Sports Quant
- FCX Polymarket
- FCX Quant Intelligence

## Regra

Iniciar somente em modo `research` ou `simulation`. Nao executar ordens financeiras reais.

## Status

Submodulo pendente. A tentativa de `git submodule add` foi bloqueada pelo Git local com `Win32 error 5`.

## Comando para ativar

```bash
rm fcx-6.0/modules/quantdinger/README.md
git submodule add https://github.com/felipe-castello/QuantDinger fcx-6.0/modules/quantdinger
git submodule update --init --recursive
```

## Feature flag

`ENABLE_QUANTDINGER=false`
