const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('/api/health e /health estao registrados', () => {
  const controller = read('src/health/health.controller.ts');

  assert.match(controller, /Controller\(\['health', 'api\/health'\]\)/);
  assert.match(controller, /this\.healthService\.check\(\)/);
});

test('healthcheck retorna contrato FCX 6.0 com banco e redis', () => {
  const service = read('src/health/health.service.ts');

  assert.match(service, /version: '6\.0'/);
  assert.match(service, /database/);
  assert.match(service, /redis/);
  assert.match(service, /\$queryRaw`SELECT 1`/);
  assert.match(service, /redis\.ping\(\)/);
});

test('AppModule inicializa modulos essenciais e modulos FCX 6', () => {
  const appModule = read('src/app.module.ts');

  [
    'AssetsModule',
    'TelemetryModule',
    'AlarmsModule',
    'WorkOrdersModule',
    'UsersModule',
    'DashboardsModule',
    'IntegrationsModule',
    'PredictiveModule',
    'QuantModule',
    'KnowledgeModule',
    'ChatModule',
  ].forEach((moduleName) => assert.match(appModule, new RegExp(moduleName)));
});

test('feature flags e fallbacks seguros existem', () => {
  const featureFlags = read('src/modules/feature-flags.ts');

  [
    'ENABLE_AGENT_SKILLS',
    'ENABLE_LIBRECHAT',
    'ENABLE_LANGCHAIN',
    'ENABLE_NANGO',
    'ENABLE_QUANTDINGER',
    'ENABLE_UNDERSTAND_ANYTHING',
    'safeModuleFallback',
  ].forEach((token) => assert.match(featureFlags, new RegExp(token)));
});

test('QuantDinger e Quant Intelligence nao habilitam modo financeiro real', () => {
  const quantService = read('src/modules/quant/quant.service.ts');
  const quantDingerAdapter = fs.readFileSync(
    path.resolve(root, '..', 'fcx-6.0/packages/fcx-quantdinger-adapter/src/index.js'),
    'utf8',
  );

  assert.match(quantService, /research/);
  assert.match(quantService, /simulation/);
  assert.doesNotMatch(quantService, /live-trading|executeOrder|placeOrder/);
  assert.match(quantDingerAdapter, /Only research\/simulation modes are allowed/);
  assert.match(quantDingerAdapter, /decision: 'BLOCK'/);
});

test('Agent Master possui roteamento, log de decisao e gates de aprovacao', () => {
  const agentsModule = read('src/modules/agents/agents.module.ts');
  const registry = read('src/modules/agents/agent-registry.ts');
  const router = read('src/modules/agents/task-router.service.ts');
  const approvals = read('src/modules/agents/approval-workflow.service.ts');

  ['MasterAgentService', 'TaskRouterService', 'DecisionLogService', 'ApprovalWorkflowService'].forEach((service) =>
    assert.match(agentsModule, new RegExp(service)),
  );
  assert.match(router, /requiredApprovals/);
  assert.match(registry, /fcx-software-engineering-agent/);
  assert.match(approvals, /Deployment approval requires an approved QA gate/);
});

test('Agent Master Phase 2 possui contratos de governanca sem ativar infraestrutura', () => {
  const project = path.resolve(root, '..');
  const requiredFiles = [
    'agents/master/governance/rbac-model.json',
    'agents/master/governance/approval-state-machine.json',
    'agents/master/governance/redis-orchestration.json',
    'agents/master/governance/audit-trail-model.json',
    'agents/master/governance/agent-metrics-model.json',
    'agents/master/governance/deployment-governance.json',
    'backend/prisma/proposals/agent-master-phase2-postgresql.sql',
    'docs/RBAC_MODEL.md',
    'docs/APPROVAL_WORKFLOW.md',
    'docs/AUDIT_TRAIL.md',
    'docs/AGENT_METRICS.md',
    'docs/DEPLOYMENT_GOVERNANCE.md',
  ];

  requiredFiles.forEach((file) => assert.equal(fs.existsSync(path.join(project, file)), true, `${file} ausente`));

  const approvalPolicy = fs.readFileSync(
    path.join(project, 'agents/master/governance/approval-state-machine.json'),
    'utf8',
  );
  const activeSchema = read('prisma/schema.prisma');

  assert.match(approvalPolicy, /human_approved/);
  assert.match(approvalPolicy, /No deployment approval without QA approval and registered human approval/);
  assert.doesNotMatch(activeSchema, /fcx_governance|AuditLog|AgentMetric/);
});

test('Agent Master Phase 3 possui contratos executaveis para todos os especialistas', () => {
  const project = path.resolve(root, '..');
  const specialists = ['software-architect', 'backend', 'frontend', 'database', 'iot-mqtt', 'ai-rag', 'qa', 'devops', 'documentation'];

  specialists.forEach((agentId) => {
    const base = path.join(project, 'agents', 'specialists', agentId, agentId);
    const prompt = fs.readFileSync(`${base}.prompt.md`, 'utf8');
    const workflow = JSON.parse(fs.readFileSync(`${base}.workflow.json`, 'utf8'));
    const skills = JSON.parse(fs.readFileSync(`${base}.skills.json`, 'utf8'));

    ['Objetivo', 'Entrada', 'Saída', 'Critério de sucesso'].forEach((section) =>
      assert.match(prompt, new RegExp(section)),
    );
    assert.equal(workflow.agentId, agentId);
    assert.ok(workflow.objective);
    assert.ok(workflow.input.length);
    assert.ok(workflow.output.length);
    assert.ok(workflow.successCriteria.length);
    assert.equal(skills.agentId, agentId);
    assert.ok(skills.skills.length);
  });

  const orchestration = read('src/modules/agents/executable-orchestration.service.ts');
  ['selectAgent', 'generateTask', 'forwardTask', 'registerResult'].forEach((capability) =>
    assert.match(orchestration, new RegExp(capability)),
  );
  assert.match(orchestration, /local-contract/);
});

test('Agent Master Phase 4 define tres simulacoes industriais completas', () => {
  const validation = read('src/modules/agents/industrial-validation.service.ts');
  const runner = read('scripts/run-phase4-validation.js');

  [
    'energy-monitoring-module',
    'mqtt-full-gauge-integration',
    'industrial-predictive-diagnostics',
    "agentId: 'qa'",
    "agentId: 'documentation'",
    "human: 'not_required'",
    "finalResult: 'passed'",
  ].forEach((token) => assert.match(validation, new RegExp(token)));
  assert.match(runner, /PHASE_4_INDUSTRIAL_VALIDATION_RESULTS\.json/);
  assert.match(runner, /Manual intervention required: no/);
});

test('Agent Master Phase 5 possui Runtime Operacional completo', () => {
  const module = read('src/modules/agents/agents.module.ts');
  const controller = read('src/modules/agents/runtime.controller.ts');
  const engine = read('src/modules/agents/workflow-engine.service.ts');
  const runtimeComponents = [
    'RuntimeController',
    'WorkflowEngineService',
    'RuntimeAgentRegistryService',
    'ExecutionQueueService',
    'TaskDispatcherService',
    'ResultCollectorService',
    'ExecutionDashboardService',
    'RuntimeMetricsService',
  ];

  runtimeComponents.forEach((component) => assert.match(module, new RegExp(component)));
  assert.match(controller, /agent-runtime/);
  assert.match(engine, /workflow_started/);
  assert.match(engine, /workflow_completed/);
  assert.match(engine, /collector\.collect/);
});
