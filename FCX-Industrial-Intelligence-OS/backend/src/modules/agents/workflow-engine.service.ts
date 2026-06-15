import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DecisionLogService } from './decision-log.service';
import { ExecutionQueueService } from './execution-queue.service';
import { ResultCollectorService } from './result-collector.service';
import { RuntimeAgentRegistryService } from './runtime-agent-registry.service';
import { RuntimeMetricsService } from './runtime-metrics.service';
import { ExecutableTaskRecord, RuntimeWorkflowRecord, RuntimeWorkflowRequest } from './agent.types';
import { TaskDispatcherService } from './task-dispatcher.service';

@Injectable()
export class WorkflowEngineService {
  private readonly workflows = new Map<string, RuntimeWorkflowRecord>();

  constructor(
    private readonly registry: RuntimeAgentRegistryService,
    private readonly queue: ExecutionQueueService,
    private readonly dispatcher: TaskDispatcherService,
    private readonly collector: ResultCollectorService,
    private readonly metrics: RuntimeMetricsService,
    private readonly decisionLog: DecisionLogService,
  ) {}

  execute(request: RuntimeWorkflowRequest) {
    if (!request.name?.trim() || !request.goal?.trim()) {
      throw new BadRequestException('Workflow name and goal are required.');
    }

    const startedAt = Date.now();
    const workflow: RuntimeWorkflowRecord = {
      workflowId: randomUUID(),
      name: request.name.trim(),
      goal: request.goal.trim(),
      tenantId: request.tenantId || 'unassigned-tenant',
      requestedBy: request.requestedBy || 'fcx-agent-master',
      status: 'running',
      stepTaskIds: [],
      startedAt: new Date(startedAt).toISOString(),
    };
    this.workflows.set(workflow.workflowId, workflow);
    this.metrics.workflowStarted();
    this.decisionLog.record({
      taskId: workflow.workflowId,
      type: 'workflow_started',
      decision: 'running',
      rationale: `Workflow ${workflow.name} started in local operational mode.`,
      actor: workflow.requestedBy,
      metadata: { tenantId: workflow.tenantId },
    });

    const steps = request.steps?.length
      ? request.steps
      : [{ goal: request.goal, preferredAgentId: this.registry.select(request.goal).id }];
    const completedTasks: ExecutableTaskRecord[] = [];

    try {
      steps.forEach((step, stepIndex) => {
        const selectedAgent = step.preferredAgentId || this.registry.select(step.goal).id;
        const queueItem = this.queue.enqueue(workflow.workflowId, stepIndex, {
          goal: step.goal,
          preferredAgentId: selectedAgent,
          tenantId: workflow.tenantId,
          requestedBy: workflow.requestedBy,
          acceptanceCriteria: step.acceptanceCriteria,
          input: { workflowId: workflow.workflowId, stepIndex },
        });
        const completed = this.dispatcher.dispatch(queueItem.queueId);
        workflow.stepTaskIds.push(completed.taskId);
        completedTasks.push(completed);
      });

      workflow.status = 'completed';
      workflow.completedAt = new Date().toISOString();
      workflow.durationMs = Date.now() - startedAt;
      this.metrics.workflowCompleted(workflow.durationMs);
      this.decisionLog.record({
        taskId: workflow.workflowId,
        type: 'workflow_completed',
        decision: 'completed',
        rationale: `Workflow ${workflow.name} completed ${completedTasks.length} steps.`,
        actor: 'fcx-workflow-engine',
        metadata: { tenantId: workflow.tenantId, taskCount: completedTasks.length },
      });
      return this.collector.collect(workflow, completedTasks);
    } catch (error) {
      workflow.status = 'failed';
      workflow.completedAt = new Date().toISOString();
      workflow.durationMs = Date.now() - startedAt;
      this.metrics.workflowCompleted(workflow.durationMs, true);
      throw error;
    }
  }

  find(workflowId?: string) {
    return workflowId ? this.workflows.get(workflowId) || null : [...this.workflows.values()];
  }
}
