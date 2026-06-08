function isEnabled() {
  return String(process.env.ENABLE_UNDERSTAND_ANYTHING || 'false').toLowerCase() === 'true';
}

function ingestDocument(input = {}) {
  if (!isEnabled()) {
    return {
      module: 'understand-anything',
      status: 'fallback',
      source: input.source || 'unknown',
      reason: 'ENABLE_UNDERSTAND_ANYTHING=false',
    };
  }

  return {
    module: 'understand-anything',
    status: 'queued',
    source: input.source || 'unknown',
    stages: ['parse', 'understand', 'chunk', 'index'],
  };
}

module.exports = { ingestDocument };
