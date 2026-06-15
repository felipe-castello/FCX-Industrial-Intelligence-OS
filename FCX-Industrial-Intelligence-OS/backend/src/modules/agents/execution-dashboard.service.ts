import { Injectable } from '@nestjs/common';
import { ExecutionQueueService } from './execution-queue.service';
import { ResultCollectorService } from './result-collector.service';
import { RuntimeAgentRegistryService } from './runtime-agent-registry.service';
import { RuntimeMetricsService } from './runtime-metrics.service';
import { WorkflowEngineService } from './workflow-engine.service';

@Injectable()
export class ExecutionDashboardService {
  constructor(
    private readonly registry: RuntimeAgentRegistryService,
    private readonly workflows: WorkflowEngineService,
    private readonly queue: ExecutionQueueService,
    private readonly results: ResultCollectorService,
    private readonly metrics: RuntimeMetricsService,
  ) {}

  snapshot() {
    const workflows = this.workflows.find() as Array<{ status: string }>;
    const queue = this.queue.findAll();
    return {
      runtime: 'fcx-agent-operating-system',
      mode: 'local-operational',
      externalServicesConnected: false,
      realDeploymentEnabled: false,
      agents: this.registry.findAll(),
      workflows: {
        total: workflows.length,
        running: workflows.filter((workflow) => workflow.status === 'running').length,
        completed: workflows.filter((workflow) => workflow.status === 'completed').length,
        failed: workflows.filter((workflow) => workflow.status === 'failed').length,
      },
      queue: {
        total: queue.length,
        queued: queue.filter((item) => item.status === 'queued').length,
        running: queue.filter((item) => item.status === 'running').length,
        completed: queue.filter((item) => item.status === 'completed').length,
        failed: queue.filter((item) => item.status === 'failed').length,
      },
      metrics: this.metrics.snapshot(),
      reports: this.results.find(),
      generatedAt: new Date().toISOString(),
    };
  }
}
