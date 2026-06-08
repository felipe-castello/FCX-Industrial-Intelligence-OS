function isEnabled() {
  return String(process.env.ENABLE_AGENT_SKILLS || 'false').toLowerCase() === 'true';
}

function runSkill(input = {}) {
  if (!isEnabled()) {
    return {
      module: 'agent-skills',
      status: 'fallback',
      skill: input.skill || 'unknown',
      reason: 'ENABLE_AGENT_SKILLS=false',
    };
  }

  return {
    module: 'agent-skills',
    status: 'ready',
    skill: input.skill || 'unknown',
    agents: [
      'FCX Technical Knowledge Vault Agent',
      'FCX Electronics Lab Agent',
      'FCX Sports Quant Agent',
      'FCX Industrial Intelligence Agent',
    ],
  };
}

module.exports = { runSkill };
