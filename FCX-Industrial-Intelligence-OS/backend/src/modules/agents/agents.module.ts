import { Module } from '@nestjs/common';
import { AgentsApiController } from './agents-api.controller';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { ApprovalWorkflowService } from './approval-workflow.service';
import { DecisionLogService } from './decision-log.service';
import { ExecutableOrchestrationService } from './executable-orchestration.service';
import { IndustrialValidationService } from './industrial-validation.service';
import { MasterAgentService } from './master-agent.service';
import { ExecutionDashboardService } from './execution-dashboard.service';
import { ExecutionQueueService } from './execution-queue.service';
import { ResultCollectorService } from './result-collector.service';
import { RuntimeAgentRegistryService } from './runtime-agent-registry.service';
import { RuntimeController } from './runtime.controller';
import { RuntimeMetricsService } from './runtime-metrics.service';
import { TaskDispatcherService } from './task-dispatcher.service';
import { TaskRouterService } from './task-router.service';
import { WorkflowEngineService } from './workflow-engine.service';

@Module({
  controllers: [AgentsController, AgentsApiController, RuntimeController],
  providers: [
    AgentsService,
    DecisionLogService,
    ApprovalWorkflowService,
    TaskRouterService,
    ExecutableOrchestrationService,
    IndustrialValidationService,
    RuntimeAgentRegistryService,
    ExecutionQueueService,
    RuntimeMetricsService,
    ResultCollectorService,
    TaskDispatcherService,
    WorkflowEngineService,
    ExecutionDashboardService,
    MasterAgentService,
  ],
  exports: [
    AgentsService,
    DecisionLogService,
    ApprovalWorkflowService,
    TaskRouterService,
    ExecutableOrchestrationService,
    IndustrialValidationService,
    RuntimeAgentRegistryService,
    ExecutionQueueService,
    RuntimeMetricsService,
    ResultCollectorService,
    TaskDispatcherService,
    WorkflowEngineService,
    ExecutionDashboardService,
    MasterAgentService,
  ],
})
export class AgentsModule {}
