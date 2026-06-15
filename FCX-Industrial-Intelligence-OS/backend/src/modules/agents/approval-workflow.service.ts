import { BadRequestException, Injectable } from '@nestjs/common';
import { ApprovalRecord, ApprovalStatus } from './agent.types';
import { DecisionLogService } from './decision-log.service';

@Injectable()
export class ApprovalWorkflowService {
  private readonly approvals = new Map<string, ApprovalRecord>();

  constructor(private readonly decisionLog: DecisionLogService) {}

  initialize(taskId: string, qaRequired: boolean, deploymentRequired: boolean) {
    const existing = this.approvals.get(taskId);
    if (existing) return existing;

    const record: ApprovalRecord = {
      taskId,
      qa: qaRequired ? 'pending' : 'not_required',
      deployment: deploymentRequired ? 'pending' : 'not_required',
      notes: [],
      updatedAt: new Date().toISOString(),
    };
    this.approvals.set(taskId, record);
    return record;
  }

  reviewQa(taskId: string, status: ApprovalStatus, reviewer: string, note?: string) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new BadRequestException('QA review status must be approved or rejected.');
    }

    const record = this.requireRecord(taskId);
    record.qa = status;
    record.qaReviewedBy = reviewer;
    this.update(record, note);
    this.decisionLog.record({
      taskId,
      type: 'qa_approval',
      decision: status,
      rationale: note || 'QA gate reviewed.',
      actor: reviewer,
    });
    return record;
  }

  reviewDeployment(taskId: string, status: ApprovalStatus, reviewer: string, note?: string) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new BadRequestException('Deployment review status must be approved or rejected.');
    }

    const record = this.requireRecord(taskId);
    if (status === 'approved' && record.qa !== 'approved' && record.qa !== 'not_required') {
      throw new BadRequestException('Deployment approval requires an approved QA gate.');
    }

    record.deployment = status;
    record.deploymentReviewedBy = reviewer;
    this.update(record, note);
    this.decisionLog.record({
      taskId,
      type: 'deployment_approval',
      decision: status,
      rationale: note || 'Deployment gate reviewed.',
      actor: reviewer,
    });
    return record;
  }

  find(taskId?: string) {
    return taskId ? this.approvals.get(taskId) || null : [...this.approvals.values()];
  }

  private requireRecord(taskId: string) {
    const record = this.approvals.get(taskId);
    if (!record) throw new BadRequestException(`No approval workflow exists for task ${taskId}.`);
    return record;
  }

  private update(record: ApprovalRecord, note?: string) {
    if (note) record.notes.push(note);
    record.updatedAt = new Date().toISOString();
  }
}
