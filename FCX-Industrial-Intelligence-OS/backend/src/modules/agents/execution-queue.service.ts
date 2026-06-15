import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ExecutableTaskRequest, ExecutionQueueItem } from './agent.types';

@Injectable()
export class ExecutionQueueService {
  private readonly items: ExecutionQueueItem[] = [];
  private readonly maxItems = 1000;

  enqueue(workflowId: string, stepIndex: number, request: ExecutableTaskRequest) {
    const item: ExecutionQueueItem = {
      queueId: randomUUID(),
      workflowId,
      stepIndex,
      request,
      status: 'queued',
      queuedAt: new Date().toISOString(),
    };
    this.items.push(item);
    this.items.splice(0, Math.max(0, this.items.length - this.maxItems));
    return item;
  }

  start(queueId: string) {
    const item = this.requireItem(queueId);
    if (item.status !== 'queued') throw new BadRequestException(`Queue item ${queueId} is not queued.`);
    item.status = 'running';
    item.startedAt = new Date().toISOString();
    return item;
  }

  complete(queueId: string, taskId: string) {
    const item = this.requireItem(queueId);
    item.status = 'completed';
    item.taskId = taskId;
    item.completedAt = new Date().toISOString();
    return item;
  }

  fail(queueId: string, error: string) {
    const item = this.requireItem(queueId);
    item.status = 'failed';
    item.error = error;
    item.completedAt = new Date().toISOString();
    return item;
  }

  findAll(workflowId?: string) {
    return workflowId ? this.items.filter((item) => item.workflowId === workflowId) : [...this.items];
  }

  private requireItem(queueId: string) {
    const item = this.items.find((candidate) => candidate.queueId === queueId);
    if (!item) throw new BadRequestException(`Queue item ${queueId} was not found.`);
    return item;
  }
}
