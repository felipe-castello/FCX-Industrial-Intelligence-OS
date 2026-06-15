import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ExecutableSpecialistId,
  ExecutableTaskRecord,
  ExecutableTaskRequest,
} from './agent.types';
import { DecisionLogService } from './decision-log.service';

const SPECIALIST_CONTRACTS: Record<
  ExecutableSpecialistId,
  { keywords: string[]; expectedOutput: string[]; defaultSuccessCriteria: string[] }
> = {
  'software-architect': {
    keywords: ['architecture', 'architect', 'module', 'arquitetura', 'design'],
    expectedOutput: ['architectureDecision', 'impactMap', 'implementationPlan', 'risks'],
    defaultSuccessCriteria: ['compatible-with-fcx6', 'trade-offs-documented'],
  },
  backend: {
    keywords: ['backend', 'nestjs', 'api', 'service', 'controller'],
    expectedOutput: ['changes', 'testEvidence', 'risks', 'result'],
    defaultSuccessCriteria: ['build-passes', 'tests-pass', 'contracts-preserved'],
  },
  frontend: {
    keywords: ['frontend', 'react', 'vite', 'ui', 'dashboard'],
    expectedOutput: ['changes', 'uiStates', 'buildEvidence', 'risks'],
    defaultSuccessCriteria: ['responsive', 'accessible', 'build-passes'],
  },
  database: {
    keywords: ['database', 'postgres', 'prisma', 'schema', 'query', 'banco'],
    expectedOutput: ['schemaProposal', 'indexes', 'migrationRisks', 'validationPlan'],
    defaultSuccessCriteria: ['integrity-defined', 'tenant-safe', 'rollback-defined'],
  },
  'iot-mqtt': {
    keywords: ['iot', 'mqtt', 'emqx', 'modbus', 'gateway', 'sensor'],
    expectedOutput: ['integrationMap', 'payloadContract', 'securityRules', 'testPlan'],
    defaultSuccessCriteria: ['payload-valid', 'security-defined', 'no-physical-execution'],
  },
  'ai-rag': {
    keywords: ['rag', 'retrieval', 'embedding', 'prompt', 'knowledge', 'ai'],
    expectedOutput: ['ragArchitecture', 'retrievalStrategy', 'citationPolicy', 'evaluationPlan'],
    defaultSuccessCriteria: ['grounded', 'tenant-safe', 'evaluation-defined'],
  },
  qa: {
    keywords: ['qa', 'quality', 'test', 'acceptance', 'regression', 'qualidade'],
    expectedOutput: ['qaDecision', 'findings', 'evidence', 'blockers'],
    defaultSuccessCriteria: ['all-criteria-evaluated', 'evidence-linked'],
  },
  devops: {
    keywords: ['devops', 'deploy', 'docker', 'nginx', 'release', 'rollback'],
    expectedOutput: ['readinessDecision', 'checklist', 'blockers', 'deploymentPlan'],
    defaultSuccessCriteria: ['human-approval-valid', 'rollback-defined', 'no-real-deploy'],
  },
  documentation: {
    keywords: ['documentation', 'docs', 'readme', 'runbook', 'documentacao'],
    expectedOutput: ['updatedDocumentation', 'links', 'gaps', 'changeSummary'],
    defaultSuccessCriteria: ['accurate', 'navigable', 'artifact-linked'],
  },
};

@Injectable()
export class ExecutableOrchestrationService {
  private readonly tasks = new Map<string, ExecutableTaskRecord>();
  private readonly maxTasks = 500;

  constructor(private readonly decisionLog: DecisionLogService) {}

  selectAgent(goal: string, preferredAgentId?: ExecutableSpecialistId) {
    if (preferredAgentId) return preferredAgentId;
    const normalized = goal.toLowerCase();
    const selection = (Object.entries(SPECIALIST_CONTRACTS) as Array<
      [ExecutableSpecialistId, (typeof SPECIALIST_CONTRACTS)[ExecutableSpecialistId]]
    >)
      .map(([agentId, contract]) => ({
        agentId,
        score: contract.keywords.filter((keyword) => normalized.includes(keyword)).length,
      }))
      .sort((left, right) => right.score - left.score)[0];
    return selection?.score ? selection.agentId : 'software-architect';
  }

  generateTask(request: ExecutableTaskRequest) {
    const goal = request.goal?.trim();
    if (!goal) throw new BadRequestException('Executable task goal is required.');

    const selectedAgentId = this.selectAgent(goal, request.preferredAgentId);
    const contract = SPECIALIST_CONTRACTS[selectedAgentId];
    const now = new Date().toISOString();
    const task: ExecutableTaskRecord = {
      taskId: randomUUID(),
      goal,
      tenantId: request.tenantId || 'unassigned-tenant',
      requestedBy: request.requestedBy || 'fcx-agent-master',
      selectedAgentId,
      input: request.input || {},
      expectedOutput: contract.expectedOutput,
      acceptanceCriteria: request.acceptanceCriteria?.length
        ? request.acceptanceCriteria
        : contract.defaultSuccessCriteria,
      status: 'generated',
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(task.taskId, task);
    this.trimTasks();
    this.decisionLog.record({
      taskId: task.taskId,
      type: 'task_generated',
      decision: selectedAgentId,
      rationale: `Executable task generated for ${selectedAgentId}.`,
      actor: task.requestedBy,
      metadata: { tenantId: task.tenantId, expectedOutput: task.expectedOutput },
    });
    return task;
  }

  forwardTask(taskId: string) {
    const task = this.requireTask(taskId);
    if (task.status !== 'generated') throw new BadRequestException(`Task ${taskId} cannot be forwarded from ${task.status}.`);

    task.status = 'forwarded';
    task.updatedAt = new Date().toISOString();
    task.handoff = { agentId: task.selectedAgentId, forwardedAt: task.updatedAt, mode: 'local-contract' };
    this.decisionLog.record({
      taskId,
      type: 'execution_forwarded',
      decision: task.selectedAgentId,
      rationale: 'Task forwarded through local Phase 3 contract; no external execution occurred.',
      actor: 'fcx-agent-master',
      metadata: { tenantId: task.tenantId, mode: 'local-contract' },
    });
    return task;
  }

  registerResult(
    taskId: string,
    result: { status: 'completed' | 'failed'; summary: string; output?: Record<string, unknown>; evidence?: string[] },
  ) {
    const task = this.requireTask(taskId);
    if (task.status !== 'forwarded') throw new BadRequestException(`Task ${taskId} must be forwarded before result registration.`);
    if (!result.summary?.trim()) throw new BadRequestException('Result summary is required.');

    task.status = result.status;
    task.updatedAt = new Date().toISOString();
    task.result = {
      status: result.status,
      summary: result.summary.trim(),
      output: result.output || {},
      evidence: result.evidence || [],
      registeredAt: task.updatedAt,
    };
    this.decisionLog.record({
      taskId,
      type: 'result_registered',
      decision: result.status,
      rationale: task.result.summary,
      actor: task.selectedAgentId,
      metadata: { tenantId: task.tenantId, evidenceCount: task.result.evidence.length },
    });
    return task;
  }

  find(taskId?: string) {
    return taskId ? this.tasks.get(taskId) || null : [...this.tasks.values()];
  }

  private requireTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) throw new BadRequestException(`Executable task ${taskId} was not found.`);
    return task;
  }

  private trimTasks() {
    while (this.tasks.size > this.maxTasks) {
      const oldest = this.tasks.keys().next().value as string | undefined;
      if (!oldest) return;
      this.tasks.delete(oldest);
    }
  }
}
