import { Injectable } from '@nestjs/common';
import { FEATURE_FLAGS, isFeatureEnabled, safeModuleFallback } from '../feature-flags';

@Injectable()
export class AgentsService {
  findAll() {
    return { module: 'agents', status: 'ready', data: [] };
  }

  runSkill(payload: Record<string, unknown>) {
    if (!isFeatureEnabled(FEATURE_FLAGS.agentSkills)) {
      return {
        ...safeModuleFallback('agent-skills', 'ENABLE_AGENT_SKILLS=false'),
        result: {
          skill: payload?.skill || 'unknown',
          mode: 'disabled',
          message: 'Agent Skills externo desabilitado por feature flag.',
        },
      };
    }

    try {
      return {
        module: 'agent-skills',
        status: 'ready',
        result: {
          skill: payload?.skill || 'unknown',
          agents: [
            'FCX Technical Knowledge Vault Agent',
            'FCX Electronics Lab Agent',
            'FCX Sports Quant Agent',
            'FCX Industrial Intelligence Agent',
          ],
          output: 'Adapter inicial preparado para executar skill FCX.',
        },
      };
    } catch (error) {
      return safeModuleFallback('agent-skills', error instanceof Error ? error.message : 'unknown error');
    }
  }
}
