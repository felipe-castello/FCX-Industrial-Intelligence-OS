import { Injectable } from '@nestjs/common';
import { ExecutableSpecialistId } from './agent.types';

const RUNTIME_AGENTS: Array<{
  id: ExecutableSpecialistId;
  status: 'available';
  contractPath: string;
  capabilities: string[];
}> = [
  { id: 'software-architect', status: 'available', contractPath: 'agents/specialists/software-architect', capabilities: ['architecture', 'design', 'impact'] },
  { id: 'backend', status: 'available', contractPath: 'agents/specialists/backend', capabilities: ['backend', 'nestjs', 'api'] },
  { id: 'frontend', status: 'available', contractPath: 'agents/specialists/frontend', capabilities: ['frontend', 'react', 'dashboard'] },
  { id: 'database', status: 'available', contractPath: 'agents/specialists/database', capabilities: ['database', 'postgres', 'prisma', 'schema'] },
  { id: 'iot-mqtt', status: 'available', contractPath: 'agents/specialists/iot-mqtt', capabilities: ['iot', 'mqtt', 'modbus', 'gateway'] },
  { id: 'ai-rag', status: 'available', contractPath: 'agents/specialists/ai-rag', capabilities: ['ai', 'rag', 'retrieval', 'knowledge'] },
  { id: 'qa', status: 'available', contractPath: 'agents/specialists/qa', capabilities: ['qa', 'quality', 'test', 'regression'] },
  { id: 'devops', status: 'available', contractPath: 'agents/specialists/devops', capabilities: ['devops', 'release', 'rollback', 'docker'] },
  { id: 'documentation', status: 'available', contractPath: 'agents/specialists/documentation', capabilities: ['documentation', 'docs', 'runbook'] },
];

@Injectable()
export class RuntimeAgentRegistryService {
  findAll() {
    return RUNTIME_AGENTS.map((agent) => ({ ...agent }));
  }

  find(agentId: ExecutableSpecialistId) {
    return RUNTIME_AGENTS.find((agent) => agent.id === agentId) || null;
  }

  select(goal: string) {
    const normalized = goal.toLowerCase();
    const selected = RUNTIME_AGENTS.map((agent) => ({
      agent,
      score: agent.capabilities.filter((capability) => normalized.includes(capability)).length,
    })).sort((left, right) => right.score - left.score)[0];
    return selected?.score ? selected.agent : RUNTIME_AGENTS[0];
  }
}
