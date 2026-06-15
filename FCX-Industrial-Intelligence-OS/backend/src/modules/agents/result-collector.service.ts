import { Injectable } from '@nestjs/common';
import { ExecutableTaskRecord, RuntimeWorkflowRecord } from './agent.types';
import { DecisionLogService } from './decision-log.service';

@Injectable()
export class ResultCollectorService {
  private readonly reports = new Map<string, Record<string, unknown>>();

  constructor(private readonly decisionLog: DecisionLogService) {}

  collect(workflow: RuntimeWorkflowRecord, tasks: ExecutableTaskRecord[]) {
    const report = {
      workflow,
      summary: `${workflow.name} completed ${tasks.length} local runtime steps.`,
      results: tasks.map((task) => ({
        taskId: task.taskId,
        agentId: task.selectedAgentId,
        status: task.status,
        summary: task.result?.summary,
        evidence: task.result?.evidence || [],
      })),
      auditTrail: [
        ...this.decisionLog.findAll(workflow.workflowId),
        ...tasks.flatMap((task) => this.decisionLog.findAll(task.taskId)),
      ],
      generatedAt: new Date().toISOString(),
    };
    this.reports.set(workflow.workflowId, report);
    return report;
  }

  find(workflowId?: string) {
    return workflowId ? this.reports.get(workflowId) || null : [...this.reports.values()];
  }
}
