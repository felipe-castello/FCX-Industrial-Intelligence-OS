# FCX 6.0

FCX Intelligence Platform 6.0 workspace.

## Modulos externos independentes

O FCX 6.0 reserva `fcx-6.0/modules` para repositorios externos isolados:

- `agent-skills`
- `librechat`
- `langchain`
- `nango`
- `quantdinger`
- `understand-anything`
- `trading-agents`

Esses modulos sao acessados por adapters FCX e carregados por feature flags. O core deve continuar funcionando mesmo se qualquer modulo externo falhar.

## Novo módulo

### FCX Quant Intelligence powered by TradingAgents

Módulo de pesquisa quantitativa para análise de ativos financeiros em modo seguro de pesquisa, simulação e dashboard.

Componentes:

- `modules/trading-agents`: submodule pendente do TradingAgents.
- `apps/fcx-quant-trading`: aplicação wrapper de pesquisa.
- `packages/fcx-trading-agents-adapter`: adapter FCX para pipeline TradingAgents.

Regra:

- Não executar ordens reais.
- Toda decisão passa por Risk Manager.
- `riskScore > 70` retorna `BLOCK`.
- `confidence < 60` retorna `REVIEW`.
