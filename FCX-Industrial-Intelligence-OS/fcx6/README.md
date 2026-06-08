# FCX Intelligence Platform 6.0

Estrutura modular inicial para evoluir o FCX Industrial Intelligence OS 5.0 sem quebrar a base atual.

## Objetivo

Organizar os novos domínios de inteligência, agentes, conhecimento, integrações e decisão em uma área isolada do projeto.

## Módulos

- `agent-skills`
- `product-intelligence`
- `ai-command-center`
- `knowledge-intelligence`
- `agent-orchestration`
- `integration-hub`
- `architecture-intelligence`
- `communication-intelligence`
- `decision-intelligence`
- `docs`

## Regra de evolução

Nenhuma funcionalidade do FCX 6.0 deve substituir contratos do FCX 5.0 sem migração versionada, documentação e plano de rollback.

## FCX Quant Intelligence

O FCX 6.0 agora possui a area isolada `fcx-6.0/` para o modulo **FCX Quant Intelligence powered by TradingAgents**.

Esse modulo adiciona uma camada de pesquisa quantitativa com Market Scanner, Technical Analyst, Sentiment Analyst, News Analyst, Risk Manager, Portfolio Manager e Decision Logger.

Regras principais:

- Operar somente em modo `research`, `simulation` ou `dashboard`.
- Nunca executar ordens reais.
- Toda decisao deve passar pelo Risk Manager.
- `riskScore > 70` retorna `BLOCK`.
- `confidence < 60` retorna `REVIEW`.
