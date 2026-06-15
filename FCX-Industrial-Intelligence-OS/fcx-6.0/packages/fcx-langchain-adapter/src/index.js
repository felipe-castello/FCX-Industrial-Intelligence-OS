function isEnabled() {
  return String(process.env.ENABLE_LANGCHAIN || 'true').toLowerCase() === 'true';
}

function createPipeline(input = {}) {
  if (!isEnabled()) {
    return { module: 'langchain', status: 'fallback', reason: 'ENABLE_LANGCHAIN=false' };
  }

  return {
    module: 'langchain',
    status: 'ready',
    pipeline: input.pipeline || 'rag-agent',
    stages: ['load', 'plan', 'retrieve', 'reason', 'validate'],
  };
}

module.exports = { createPipeline };
