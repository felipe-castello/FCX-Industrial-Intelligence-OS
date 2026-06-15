export const FEATURE_FLAGS = {
  agentSkills: 'ENABLE_AGENT_SKILLS',
  libreChat: 'ENABLE_LIBRECHAT',
  langchain: 'ENABLE_LANGCHAIN',
  nango: 'ENABLE_NANGO',
  quantDinger: 'ENABLE_QUANTDINGER',
  understandAnything: 'ENABLE_UNDERSTAND_ANYTHING',
} as const;

export function isFeatureEnabled(flagName: string): boolean {
  return String(process.env[flagName] || 'false').toLowerCase() === 'true';
}

export function safeModuleFallback(moduleName: string, reason: string) {
  console.error(`[FCX_MODULE_FALLBACK] ${moduleName}: ${reason}`);

  return {
    module: moduleName,
    status: 'fallback',
    reason,
    safe: true,
  };
}
