import { Injectable } from '@nestjs/common';
import { DecisionLogService } from './decision-log.service';
import { ExecutableOrchestrationService } from './executable-orchestration.service';
import { ExecutionQueueService } from './execution-queue.service';
import { RuntimeMetricsService } from './runtime-metrics.service';

@Injectable()
export class TaskDispatcherService {
  constructor(
    private readonly queue: ExecutionQueueService,
    private readonly orchestration: ExecutableOrchestrationService,
    private readonly metrics: RuntimeMetricsService,
    private readonly decisionLog: DecisionLogService,
  ) {}

  dispatch(queueId: string) {
    const item = this.queue.start(queueId);
    const generated = this.orchestration.generateTask(item.request);
    this.metrics.taskStarted(generated.selectedAgentId);
    this.decisionLog.record({
      taskId: generated.taskId,
      type: 'queue_event',
      decision: 'running',
      rationale: `Runtime queue item ${queueId} dispatched.`,
      actor: 'fcx-task-dispatcher',
      metadata: { workflowId: item.workflowId, queueId },
    });

    try {
      this.orchestration.forwardTask(generated.taskId);
      const completed = this.orchestration.registerResult(generated.taskId, {
        status: 'completed',
        summary: `${generated.selectedAgentId} completed the local runtime workflow step.`,
        output: { runtimeMode: 'local-operational', externalOperations: false },
        evidence: [`runtime:${item.workflowId}:${generated.selectedAgentId}`, 'external-operations:none'],
      });
      this.queue.complete(queueId, generated.taskId);
      this.metrics.taskCompleted(generated.selectedAgentId, false, 0);
      return completed;
    } catch (error) {
      this.queue.fail(queueId, error instanceof Error ? error.message : 'unknown runtime error');
      this.metrics.taskCompleted(generated.selectedAgentId, true, 0);
      throw error;
    }
  }
}
