export type AgentDomain = 'engineering' | 'strategy' | 'industrial' | 'trade' | 'sports' | 'electronics' | 'knowledge';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ApprovalStatus = 'not_required' | 'pending' | 'approved' | 'rejected';

export interface AgentDefinition {
  id: string;
  name: string;
  role: 'master' | 'specialist';
  domain: AgentDomain | 'orchestration';
  capabilities: string[];
  tools: string[];
  constraints: string[];
  requiresHumanApprovalFor: string[];
}

export interface AgentTask {
  taskId?: string;
  goal?: string;
  domain?: AgentDomain;
  riskLevel?: RiskLevel;
  requestedBy?: string;
  tenantId?: string;
  metadata?: Record<string, unknown>;
}

export interface TaskRoute {
  taskId: string;
  goal: string;
  domain: AgentDomain;
  riskLevel: RiskLevel;
  primaryAgentId: string;
  supportingAgentIds: string[];
  requiredApprovals: Array<'qa' | 'deployment'>;
  status: 'routed' | 'blocked';
  reason: string;
  createdAt: string;
}

export interface DecisionLogEntry {
  id: string;
  taskId: string;
  type:
    | 'routing'
    | 'task_generated'
    | 'execution_forwarded'
    | 'result_registered'
    | 'simulation_approval'
    | 'validation_scenario'
    | 'workflow_started'
    | 'queue_event'
    | 'workflow_completed'
    | 'qa_approval'
    | 'deployment_approval';
  decision: string;
  rationale: string;
  actor: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface IndustrialValidationScenarioResult {
  scenarioId: string;
  name: string;
  selectedAgent: ExecutableSpecialistId;
  executedFlow: ExecutableSpecialistId[];
  generatedTaskIds: string[];
  approvals: {
    qa: 'approved';
    human: 'not_required';
    deployment: 'not_required';
    mode: 'controlled-simulation';
  };
  finalResult: 'passed' | 'failed';
  auditTrail: DecisionLogEntry[];
}

export type ExecutableSpecialistId =
  | 'software-architect'
  | 'backend'
  | 'frontend'
  | 'database'
  | 'iot-mqtt'
  | 'ai-rag'
  | 'qa'
  | 'devops'
  | 'documentation';

export interface ExecutableTaskRequest {
  goal: string;
  requestedBy?: string;
  tenantId?: string;
  preferredAgentId?: ExecutableSpecialistId;
  input?: Record<string, unknown>;
  acceptanceCriteria?: string[];
}

export interface ExecutableTaskRecord {
  taskId: string;
  goal: string;
  tenantId: string;
  requestedBy: string;
  selectedAgentId: ExecutableSpecialistId;
  input: Record<string, unknown>;
  expectedOutput: string[];
  acceptanceCriteria: string[];
  status: 'generated' | 'forwarded' | 'completed' | 'failed';
  handoff?: {
    agentId: ExecutableSpecialistId;
    forwardedAt: string;
    mode: 'local-contract';
  };
  result?: {
    status: 'completed' | 'failed';
    summary: string;
    output: Record<string, unknown>;
    evidence: string[];
    registeredAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalRecord {
  taskId: string;
  qa: ApprovalStatus;
  deployment: ApprovalStatus;
  qaReviewedBy?: string;
  deploymentReviewedBy?: string;
  notes: string[];
  updatedAt: string;
}

export interface RuntimeWorkflowStep {
  goal: string;
  preferredAgentId?: ExecutableSpecialistId;
  acceptanceCriteria?: string[];
}

export interface RuntimeWorkflowRequest {
  name: string;
  goal: string;
  tenantId?: string;
  requestedBy?: string;
  steps?: RuntimeWorkflowStep[];
}

export interface RuntimeWorkflowRecord {
  workflowId: string;
  name: string;
  goal: string;
  tenantId: string;
  requestedBy: string;
  status: 'running' | 'completed' | 'failed';
  stepTaskIds: string[];
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
}

export interface ExecutionQueueItem {
  queueId: string;
  workflowId: string;
  stepIndex: number;
  request: ExecutableTaskRequest;
  status: 'queued' | 'running' | 'completed' | 'failed';
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  taskId?: string;
  error?: string;
}
