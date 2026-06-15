import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AGENT_REGISTRY } from './agent-registry';
import { AgentDomain, AgentTask, RiskLevel, TaskRoute } from './agent.types';
import { ApprovalWorkflowService } from './approval-workflow.service';
import { DecisionLogService } from './decision-log.service';

const DOMAIN_KEYWORDS: Record<AgentDomain, string[]> = {
  engineering: ['code', 'build', 'bug', 'feature', 'refactor', 'implement', 'codigo', 'compilar', 'implementar'],
  strategy: ['architecture', 'roadmap', 'strategy', 'governance', 'arquitetura', 'estrategia'],
  industrial: ['asset', 'alarm', 'telemetry', 'maintenance', 'ativo', 'alarme', 'telemetria', 'manutencao'],
  trade: ['trade', 'market', 'financial', 'mercado', 'financeiro'],
  sports: ['sports', 'sport', 'game', 'match', 'esporte', 'jogo'],
  electronics: ['electronics', 'sensor', 'gateway', 'modbus', 'firmware', 'eletronica'],
  knowledge: ['document', 'manual', 'knowledge', 'procedure', 'documento', 'manual', 'procedimento'],
};

@Injectable()
export class TaskRouterService {
  constructor(
    private readonly decisionLog: DecisionLogService,
    private readonly approvals: ApprovalWorkflowService,
  ) {}

  route(task: AgentTask): TaskRoute {
    const goal = task.goal?.trim();
    if (!goal) throw new BadRequestException('Task goal is required.');

    const taskId = task.taskId || randomUUID();
    const domain = task.domain || this.classifyDomain(goal);
    const riskLevel = task.riskLevel || this.classifyRisk(goal);
    const primary = AGENT_REGISTRY.find((agent) => agent.role === 'specialist' && agent.domain === domain);
    if (!primary) throw new BadRequestException(`No specialist registered for domain ${domain}.`);

    const requiredApprovals: Array<'qa' | 'deployment'> = ['qa'];
    if (riskLevel === 'high' || riskLevel === 'critical' || /\bdeploy(ment)?\b/i.test(goal)) {
      requiredApprovals.push('deployment');
    }

    const route: TaskRoute = {
      taskId,
      goal,
      domain,
      riskLevel,
      primaryAgentId: primary.id,
      supportingAgentIds: this.supportingAgents(domain),
      requiredApprovals,
      status: 'routed',
      reason: `Task classified as ${domain} with ${riskLevel} risk.`,
      createdAt: new Date().toISOString(),
    };

    this.approvals.initialize(taskId, true, requiredApprovals.includes('deployment'));
    this.decisionLog.record({
      taskId,
      type: 'routing',
      decision: primary.id,
      rationale: route.reason,
      actor: task.requestedBy || 'fcx-agent-master',
      metadata: { domain, riskLevel, supportingAgentIds: route.supportingAgentIds },
    });
    return route;
  }

  private classifyDomain(goal: string): AgentDomain {
    const normalized = goal.toLowerCase();
    const match = (Object.entries(DOMAIN_KEYWORDS) as Array<[AgentDomain, string[]]>)
      .map(([domain, keywords]) => ({ domain, score: keywords.filter((keyword) => normalized.includes(keyword)).length }))
      .sort((a, b) => b.score - a.score)[0];
    return match?.score ? match.domain : 'strategy';
  }

  private classifyRisk(goal: string): RiskLevel {
    if (/(critical|emergency|irreversible|production|deploy|critico|emergencia|producao)/i.test(goal)) return 'critical';
    if (/(security|electrical|financial|delete|seguranca|eletrico|financeiro|excluir)/i.test(goal)) return 'high';
    if (/(change|update|maintenance|alterar|atualizar|manutencao)/i.test(goal)) return 'medium';
    return 'low';
  }

  private supportingAgents(domain: AgentDomain) {
    const supportMap: Record<AgentDomain, string[]> = {
      engineering: ['fcx-strategic-council', 'fcx-knowledge-vault-agent'],
      strategy: ['fcx-knowledge-vault-agent'],
      industrial: ['fcx-knowledge-vault-agent', 'fcx-electronics-lab-agent'],
      trade: ['fcx-strategic-council'],
      sports: ['fcx-strategic-council'],
      electronics: ['fcx-knowledge-vault-agent', 'fcx-industrial-agent'],
      knowledge: ['fcx-strategic-council'],
    };
    return supportMap[domain];
  }
}
