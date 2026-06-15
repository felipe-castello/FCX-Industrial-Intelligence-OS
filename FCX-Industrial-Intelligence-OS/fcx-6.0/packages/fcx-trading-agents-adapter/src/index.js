const fs = require('fs');
const path = require('path');

const REQUIRED_PROVIDER_KEYS = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_API_KEY'];

function hasProviderKey() {
  return REQUIRED_PROVIDER_KEYS.some((key) => Boolean(process.env[key]));
}

function assertCanAnalyze() {
  if (!hasProviderKey()) {
    const error = new Error('Missing LLM provider API key. Configure OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_API_KEY.');
    error.code = 'MISSING_API_KEY';
    throw error;
  }
}

function normalizeInput(input = {}) {
  return {
    symbol: String(input.symbol || '').trim().toUpperCase(),
    market: String(input.market || 'stocks').trim().toLowerCase(),
    timeframe: String(input.timeframe || '1d').trim(),
    mode: String(input.mode || process.env.TRADING_AGENTS_MODE || 'research').trim().toLowerCase(),
    mockSignals: input.mockSignals || {},
  };
}

function validateInput(input) {
  if (!input.symbol) {
    throw new Error('symbol is required');
  }

  if (!['research', 'simulation', 'dashboard'].includes(input.mode)) {
    throw new Error('Only research, simulation, and dashboard modes are allowed.');
  }
}

async function analyzeAsset(symbol, market = 'stocks', timeframe = '1d') {
  return runTradingAgentsPipeline({ symbol, market, timeframe, mode: process.env.TRADING_AGENTS_MODE || 'research' });
}

async function runTradingAgentsPipeline(input = {}) {
  assertCanAnalyze();
  const normalized = normalizeInput(input);
  validateInput(normalized);

  const riskReport = generateRiskReport(normalized);
  const portfolioDecision = generatePortfolioDecision({
    ...normalized,
    riskScore: riskReport.riskScore,
    confidence: normalized.mockSignals.confidence,
    edge: normalized.mockSignals.edge,
  });

  const result = blockOperationIfRiskHigh({
    decision: portfolioDecision.decision,
    confidence: portfolioDecision.confidence,
    riskScore: riskReport.riskScore,
    summary: portfolioDecision.summary,
    agents: [
      'Market Scanner',
      'Technical Analyst',
      'Sentiment Analyst',
      'News Analyst',
      'Risk Manager',
      'Portfolio Manager',
      'Decision Logger',
    ],
    warnings: [...riskReport.warnings, ...portfolioDecision.warnings],
    mode: normalized.mode,
    symbol: normalized.symbol,
    market: normalized.market,
    timeframe: normalized.timeframe,
  });

  saveDecisionLog(result);
  return result;
}

function generateRiskReport(input = {}) {
  const conservative = (process.env.FCX_RISK_MODE || 'conservative') === 'conservative';
  const riskScore = Number.isFinite(Number(input.mockSignals?.riskScore ?? input.riskScore))
    ? Number(input.mockSignals?.riskScore ?? input.riskScore)
    : conservative
      ? 45
      : 35;

  const warnings = [];

  if (!process.env.FINNHUB_API_KEY) {
    warnings.push('FINNHUB_API_KEY not configured; market/news data may be incomplete.');
  }

  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    warnings.push('Reddit credentials not configured; sentiment data may be incomplete.');
  }

  if (riskScore > 70) {
    warnings.push('Risk Manager blocked this analysis because riskScore is above 70.');
  }

  return {
    riskScore,
    riskLevel: riskScore > 70 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'moderate' : 'low',
    warnings,
  };
}

function generatePortfolioDecision(input = {}) {
  const confidence = Number.isFinite(Number(input.confidence)) ? Number(input.confidence) : 65;
  const edge = Number.isFinite(Number(input.edge)) ? Number(input.edge) : 0;
  const warnings = [];

  let decision = 'HOLD';

  if (edge > 0.08 && confidence >= 70) {
    decision = 'BUY';
  }

  if (edge < -0.08 && confidence >= 70) {
    decision = 'SELL';
  }

  if (confidence < 60) {
    decision = 'REVIEW';
    warnings.push('Portfolio Manager requires review because confidence is below 60.');
  }

  return {
    decision,
    confidence,
    summary: `Research-only ${decision} decision for ${input.symbol || 'asset'} on ${input.market || 'market'} (${input.timeframe || '1d'}).`,
    warnings,
  };
}

function blockOperationIfRiskHigh(result = {}) {
  if (Number(result.riskScore) > 70) {
    return {
      ...result,
      decision: 'BLOCK',
      warnings: Array.from(new Set([...(result.warnings || []), 'Blocked by FCX risk policy: riskScore > 70.'])),
    };
  }

  if (Number(result.confidence) < 60) {
    return {
      ...result,
      decision: 'REVIEW',
      warnings: Array.from(new Set([...(result.warnings || []), 'Review required by FCX policy: confidence < 60.'])),
    };
  }

  return result;
}

function saveDecisionLog(result = {}) {
  const logPath = process.env.FCX_DECISION_LOG_PATH
    ? path.resolve(process.env.FCX_DECISION_LOG_PATH)
    : path.resolve(__dirname, '../../../apps/fcx-quant-trading/logs/decision-log.jsonl');
  const logDir = path.dirname(logPath);

  fs.mkdirSync(logDir, { recursive: true });
  fs.appendFileSync(
    logPath,
    `${JSON.stringify({ ...result, loggedAt: new Date().toISOString() })}\n`,
  );
  return true;
}

module.exports = {
  analyzeAsset,
  runTradingAgentsPipeline,
  generateRiskReport,
  generatePortfolioDecision,
  saveDecisionLog,
  blockOperationIfRiskHigh,
};
