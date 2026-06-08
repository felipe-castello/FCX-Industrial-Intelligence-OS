function isEnabled() {
  return String(process.env.ENABLE_NANGO || 'false').toLowerCase() === 'true';
}

function syncConnector(input = {}) {
  if (!isEnabled()) {
    return {
      module: 'nango',
      status: 'fallback',
      connector: input.connector || 'unknown',
      reason: 'ENABLE_NANGO=false',
    };
  }

  return {
    module: 'nango',
    status: 'queued',
    connector: input.connector || 'unknown',
    mode: 'oauth-safe-sync',
  };
}

module.exports = { syncConnector };
