function isEnabled() {
  return String(process.env.ENABLE_QUANTDINGER || 'false').toLowerCase() === 'true';
}

function analyzeQuant(input = {}) {
  const mode = input.mode || 'research';

  if (!['research', 'simulation'].includes(mode)) {
    return { module: 'quantdinger', status: 'blocked', decision: 'BLOCK', reason: 'Only research/simulation modes are allowed.' };
  }

  if (!isEnabled()) {
    return { module: 'quantdinger', status: 'fallback', decision: 'REVIEW', reason: 'ENABLE_QUANTDINGER=false' };
  }

  return {
    module: 'quantdinger',
    status: 'ready',
    decision: 'REVIEW',
    riskMode: process.env.FCX_RISK_MODE || 'conservative',
  };
}

module.exports = { analyzeQuant };
