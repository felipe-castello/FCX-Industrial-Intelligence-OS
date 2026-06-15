# TradingAgents Module

Este diretório é reservado para o repositório TradingAgents como módulo independente do FCX 6.0.

## Repositório base

```text
https://github.com/TauricResearch/TradingAgents
```

## Status

Submodule pendente.

A tentativa de executar `git submodule add https://github.com/TauricResearch/TradingAgents fcx-6.0/modules/trading-agents` foi bloqueada pelo ambiente Git atual com erro de permissão. O código do TradingAgents não foi copiado para o core FCX.

## Comando recomendado em ambiente com Git liberado

```bash
rm fcx-6.0/modules/trading-agents/README.md
git submodule add https://github.com/TauricResearch/TradingAgents fcx-6.0/modules/trading-agents
git submodule update --init --recursive
```

## Regra FCX

TradingAgents deve permanecer como módulo de pesquisa/quant, sem execução de ordens reais e sem ser misturado ao core industrial.
