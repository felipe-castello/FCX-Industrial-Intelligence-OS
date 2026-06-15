import { Injectable } from '@nestjs/common';
import { ExecutableSpecialistId } from './agent.types';

@Injectable()
export class RuntimeMetricsService {
  private workflowsExecuted = 0;
  private workflowsFailed = 0;
  private tasksExecuted = 0;
  private tasksFailed = 0;
  private totalDurationMs = 0;
  private tokensConsumed = 0;
  private readonly activeAgents = new Set<ExecutableSpecialistId>();

  workflowStarted() {
    this.workflowsExecuted += 1;
  }

  workflowCompleted(durationMs: number, failed = false) {
    this.totalDurationMs += durationMs;
    if (failed) this.workflowsFailed += 1;
  }

  taskStarted(agentId: ExecutableSpecialistId) {
    this.activeAgents.add(agentId);
  }

  taskCompleted(agentId: ExecutableSpecialistId, failed = false, simulatedTokens = 0) {
    this.activeAgents.delete(agentId);
    this.tasksExecuted += 1;
    this.tokensConsumed += simulatedTokens;
    if (failed) this.tasksFailed += 1;
  }

  snapshot() {
    return {
      workflowsExecuted: this.workflowsExecuted,
      workflowsFailed: this.workflowsFailed,
      tasksExecuted: this.tasksExecuted,
      tasksFailed: this.tasksFailed,
      tokensConsumed: this.tokensConsumed,
      activeAgents: [...this.activeAgents],
      averageWorkflowDurationMs: this.workflowsExecuted ? Math.round(this.totalDurationMs / this.workflowsExecuted) : 0,
      sla: { targetMs: 30_000, breaches: this.totalDurationMs > this.workflowsExecuted * 30_000 ? 1 : 0 },
    };
  }
}
