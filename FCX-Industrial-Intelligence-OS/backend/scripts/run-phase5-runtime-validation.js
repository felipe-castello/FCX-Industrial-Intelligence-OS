const fs = require('node:fs');
const path = require('node:path');
const { DecisionLogService } = require('../dist/modules/agents/decision-log.service');
const { ExecutableOrchestrationService } = require('../dist/modules/agents/executable-orchestration.service');
const { RuntimeAgentRegistryService } = require('../dist/modules/agents/runtime-agent-registry.service');
const { ExecutionQueueService } = require('../dist/modules/agents/execution-queue.service');
const { RuntimeMetricsService } = require('../dist/modules/agents/runtime-metrics.service');
const { ResultCollectorService } = require('../dist/modules/agents/result-collector.service');
const { TaskDispatcherService } = require('../dist/modules/agents/task-dispatcher.service');
const { WorkflowEngineService } = require('../dist/modules/agents/workflow-engine.service');
const { ExecutionDashboardService } = require('../dist/modules/agents/execution-dashboard.service');

const audit = new DecisionLogService();
const orchestration = new ExecutableOrchestrationService(audit);
const registry = new RuntimeAgentRegistryService();
const queue = new ExecutionQueueService();
const metrics = new RuntimeMetricsService();
const collector = new ResultCollectorService(audit);
const dispatcher = new TaskDispatcherService(queue, orchestration, metrics, audit);
const engine = new WorkflowEngineService(registry, queue, dispatcher, collector, metrics, audit);
const dashboard = new ExecutionDashboardService(registry, engine, queue, collector, metrics);

const report = engine.execute({
  name: 'FCX Runtime Operational Validation',
  goal: 'Execute a complete local FCX Agent Operating System workflow',
  tenantId: 'fcx-runtime-validation',
  requestedBy: 'phase5-validation',
  steps: [
    { goal: 'Define runtime architecture validation.', preferredAgentId: 'software-architect' },
    { goal: 'Validate backend runtime contracts.', preferredAgentId: 'backend' },
    { goal: 'Validate runtime quality evidence.', preferredAgentId: 'qa' },
    { goal: 'Register runtime execution documentation.', preferredAgentId: 'documentation' },
  ],
});
const snapshot = dashboard.snapshot();

if (
  report.workflow.status !== 'completed' ||
  report.results.length !== 4 ||
  snapshot.metrics.tasksExecuted !== 4 ||
  snapshot.workflows.completed !== 1 ||
  report.auditTrail.length === 0
) {
  throw new Error('Phase 5 runtime validation failed.');
}

const outputDir = path.resolve(__dirname, '..', '..', 'docs', 'validation');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'PHASE_5_RUNTIME_EXECUTION_REPORT.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, 'PHASE_5_RUNTIME_DASHBOARD.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
fs.writeFileSync(
  path.join(outputDir, 'PHASE_5_RUNTIME_VALIDATION_REPORT.md'),
  `# FCX Agent Master Phase 5 Runtime Validation

## Result

- Workflow: ${report.workflow.name}
- Status: ${report.workflow.status}
- Runtime mode: local operational
- Tasks executed: ${report.results.length}
- Queue completed: ${snapshot.queue.completed}
- Audit events: ${report.auditTrail.length}
- Metrics registered: yes
- Execution report generated: yes
- External services connected: no
- Real deployment enabled: no

## Executed Agents

${report.results.map((result) => `- ${result.agentId}: ${result.status}`).join('\n')}

## Acceptance Criteria

- Complete workflow execution: passed.
- All executions registered: passed.
- Metrics registered: passed.
- Audit Trail registered: passed.
- Execution reports produced: passed.
`,
);
console.log(`Phase 5 runtime validation passed: workflow=${report.workflow.workflowId} tasks=${report.results.length}.`);
