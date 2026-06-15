import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RuntimeWorkflowRequest } from './agent.types';
import { ExecutionDashboardService } from './execution-dashboard.service';
import { ExecutionQueueService } from './execution-queue.service';
import { ResultCollectorService } from './result-collector.service';
import { RuntimeAgentRegistryService } from './runtime-agent-registry.service';
import { WorkflowEngineService } from './workflow-engine.service';

@Controller('api/agent-runtime')
export class RuntimeController {
  constructor(
    private readonly workflowEngine: WorkflowEngineService,
    private readonly registry: RuntimeAgentRegistryService,
    private readonly queue: ExecutionQueueService,
    private readonly collector: ResultCollectorService,
    private readonly dashboard: ExecutionDashboardService,
  ) {}

  @Post('workflows/execute')
  execute(@Body() request: RuntimeWorkflowRequest) {
    return this.workflowEngine.execute(request);
  }

  @Get('workflows')
  workflows() {
    return this.workflowEngine.find();
  }

  @Get('workflows/:workflowId')
  workflow(@Param('workflowId') workflowId: string) {
    return this.workflowEngine.find(workflowId);
  }

  @Get('registry')
  agentRegistry() {
    return this.registry.findAll();
  }

  @Get('queue')
  executionQueue() {
    return this.queue.findAll();
  }

  @Get('reports')
  reports() {
    return this.collector.find();
  }

  @Get('reports/:workflowId')
  report(@Param('workflowId') workflowId: string) {
    return this.collector.find(workflowId);
  }

  @Get('dashboard')
  executionDashboard() {
    return this.dashboard.snapshot();
  }
}
