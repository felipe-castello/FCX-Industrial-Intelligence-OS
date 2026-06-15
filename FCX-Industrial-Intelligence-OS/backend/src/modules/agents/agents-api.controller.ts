import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentTask, ApprovalStatus, ExecutableTaskRequest } from './agent.types';
import { ApprovalWorkflowService } from './approval-workflow.service';
import { DecisionLogService } from './decision-log.service';
import { MasterAgentService } from './master-agent.service';
import { IndustrialValidationService } from './industrial-validation.service';

@Controller('api/agents')
export class AgentsApiController {
  constructor(
    private readonly service: AgentsService,
    private readonly masterAgent: MasterAgentService,
    private readonly decisionLog: DecisionLogService,
    private readonly approvals: ApprovalWorkflowService,
    private readonly industrialValidation: IndustrialValidationService,
  ) {}

  @Post('industrial-validation/simulate')
  simulateIndustrialValidation() {
    return this.industrialValidation.runAll();
  }

  @Post('run-skill')
  runSkill(@Body() payload: Record<string, unknown>) {
    return this.service.runSkill(payload);
  }

  @Post('route')
  route(@Body() task: AgentTask) {
    return this.masterAgent.planAndRoute(task);
  }

  @Post('orchestrate')
  orchestrate(@Body() task: ExecutableTaskRequest) {
    return this.masterAgent.orchestrate(task);
  }

  @Get('executable-tasks')
  executableTasks() {
    return { module: 'agent-executable-tasks', status: 'ready', data: this.masterAgent.executableTasks() };
  }

  @Get('executable-tasks/:taskId')
  executableTask(@Param('taskId') taskId: string) {
    return { module: 'agent-executable-tasks', status: 'ready', data: this.masterAgent.executableTasks(taskId) };
  }

  @Post('executable-tasks/:taskId/result')
  registerExecutableResult(
    @Param('taskId') taskId: string,
    @Body() result: { status: 'completed' | 'failed'; summary: string; output?: Record<string, unknown>; evidence?: string[] },
  ) {
    return this.masterAgent.registerResult(taskId, result);
  }

  @Get('decisions')
  decisions(@Query('taskId') taskId?: string) {
    return { module: 'agent-decisions', status: 'ready', data: this.decisionLog.findAll(taskId) };
  }

  @Get('approvals')
  approvalList() {
    return { module: 'agent-approvals', status: 'ready', data: this.approvals.find() };
  }

  @Get('approvals/:taskId')
  approval(@Param('taskId') taskId: string) {
    return { module: 'agent-approvals', status: 'ready', data: this.approvals.find(taskId) };
  }

  @Post('approvals/:taskId/qa')
  reviewQa(
    @Param('taskId') taskId: string,
    @Body() payload: { status: ApprovalStatus; reviewer: string; note?: string },
  ) {
    return this.approvals.reviewQa(taskId, payload.status, payload.reviewer || 'unknown-reviewer', payload.note);
  }

  @Post('approvals/:taskId/deployment')
  reviewDeployment(
    @Param('taskId') taskId: string,
    @Body() payload: { status: ApprovalStatus; reviewer: string; note?: string },
  ) {
    return this.approvals.reviewDeployment(taskId, payload.status, payload.reviewer || 'unknown-reviewer', payload.note);
  }
}
