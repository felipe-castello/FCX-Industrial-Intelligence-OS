const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
  runTradingAgentsPipeline,
  blockOperationIfRiskHigh,
} = require('../src');

const testLogPath = path.join(os.tmpdir(), 'fcx-trading-agents-adapter-test.jsonl');

function withEnv(env, fn) {
  const previous = { ...process.env };
  process.env = { ...previous, ...env };
  try {
    return fn();
  } finally {
    process.env = previous;
  }
}

test('analise com simbolo valido retorna decisao de pesquisa', async () => {
  await withEnv(
    {
      OPENAI_API_KEY: 'test-key',
      FINNHUB_API_KEY: 'test-key',
      FCX_DECISION_LOG_PATH: testLogPath,
    },
    async () => {
      const result = await runTradingAgentsPipeline({
        symbol: 'AAPL',
        market: 'stocks',
        timeframe: '1d',
        mode: 'research',
        mockSignals: { confidence: 72, riskScore: 42, edge: 0.02 },
      });

      assert.equal(result.symbol, 'AAPL');
      assert.equal(result.market, 'stocks');
      assert.match(result.decision, /BUY|SELL|HOLD|REVIEW|BLOCK/);
      assert.ok(result.agents.includes('Risk Manager'));
    },
  );
});

test('bloqueio por risco alto retorna BLOCK', () => {
  const result = blockOperationIfRiskHigh({
    decision: 'BUY',
    confidence: 80,
    riskScore: 88,
    warnings: [],
  });

  assert.equal(result.decision, 'BLOCK');
});

test('baixa confianca retorna REVIEW', () => {
  const result = blockOperationIfRiskHigh({
    decision: 'BUY',
    confidence: 42,
    riskScore: 20,
    warnings: [],
  });

  assert.equal(result.decision, 'REVIEW');
});

test('erro quando faltar API key', async () => {
  await withEnv(
    { OPENAI_API_KEY: '', ANTHROPIC_API_KEY: '', GOOGLE_API_KEY: '' },
    async () => {
      await assert.rejects(
        () => runTradingAgentsPipeline({ symbol: 'AAPL', market: 'stocks', timeframe: '1d', mode: 'research' }),
        /Missing LLM provider API key/,
      );
    },
  );
});
