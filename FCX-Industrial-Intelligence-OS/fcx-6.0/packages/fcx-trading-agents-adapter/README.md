# FCX TradingAgents Adapter

Adapter seguro entre o FCX Quant Intelligence e o framework TradingAgents.

## Funções

- `analyzeAsset(symbol, market, timeframe)`
- `runTradingAgentsPipeline(input)`
- `generateRiskReport(input)`
- `generatePortfolioDecision(input)`
- `saveDecisionLog(result)`
- `blockOperationIfRiskHigh(result)`

## Segurança

- Modo inicial apenas `research`.
- Não executa ordens reais.
- Toda decisão passa pelo Risk Manager.
- `riskScore > 70` retorna `BLOCK`.
- `confidence < 60` retorna `REVIEW`.
