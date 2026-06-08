function isEnabled() {
  return String(process.env.ENABLE_LIBRECHAT || 'false').toLowerCase() === 'true';
}

function createChatSession(input = {}) {
  if (!isEnabled()) {
    return {
      module: 'librechat',
      status: 'fallback',
      reason: 'ENABLE_LIBRECHAT=false',
      route: 'apps/fcx-agent-console',
    };
  }

  return {
    module: 'librechat',
    status: 'ready',
    sessionId: `fcx-chat-${Date.now()}`,
    user: input.user || 'fcx-user',
  };
}

module.exports = { createChatSession };
