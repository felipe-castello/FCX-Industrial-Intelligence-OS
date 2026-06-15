import { Injectable } from '@nestjs/common';
import { AgentTask, ExecutableTaskRequest } from './agent.types';
import { ExecutableOrchestrationService } from './executable-orchestration.service';
import { TaskRouterService } from './task-router.service';

@Injectable()
export class MasterAgentService {
  constructor(
    private readonly taskRouter: TaskRouterService,
    private readonly executableOrchestration: ExecutableOrchestrationService,
  ) {}

  planAndRoute(task: AgentTask) {
    const route = this.taskRouter.route(task);
    return {
      masterAgentId: 'fcx-agent-master',
      route,
      executionPlan: [
        `Collect evidence for the ${route.domain} domain.`,
        `Delegate primary analysis to ${route.primaryAgentId}.`,
        ...route.supportingAgentIds.map((agentId) => `Request supporting review from ${agentId}.`),
        'Submit consolidated result to QA approval.',
        ...(route.requiredApprovals.includes('deployment') ? ['Require deployment approval before release.'] : []),
      ],
      nextGate: 'qa',
    };
  }

  orchestrate(request: ExecutableTaskRequest) {
    const generatedTask = this.executableOrchestration.generateTask(request);
    return this.executableOrchestration.forwardTask(generatedTask.taskId);
  }

  registerResult(
    taskId: string,
    result: { status: 'completed' | 'failed'; summary: string; output?: Record<string, unknown>; evidence?: string[] },
  ) {
    return this.executableOrchestration.registerResult(taskId, result);
  }

  executableTasks(taskId?: string) {
    return this.executableOrchestration.find(taskId);
  }
}
