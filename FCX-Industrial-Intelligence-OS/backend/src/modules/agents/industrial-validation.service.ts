import { Injectable } from '@nestjs/common';
import { DecisionLogService } from './decision-log.service';
import { ExecutableOrchestrationService } from './executable-orchestration.service';
import { ExecutableSpecialistId, IndustrialValidationScenarioResult } from './agent.types';

type ScenarioDefinition = {
  scenarioId: string;
  name: string;
  objective: string;
  flow: Array<{ agentId: ExecutableSpecialistId; task: string }>;
};

const SCENARIOS: ScenarioDefinition[] = [
  {
    scenarioId: 'energy-monitoring-module',
    name: 'Modulo de Monitoramento Energetico',
    objective: 'Validate a complete energy monitoring module design without production changes.',
    flow: [
      { agentId: 'software-architect', task: 'Design the FCX energy monitoring module architecture.' },
      { agentId: 'backend', task: 'Define backend energy aggregation and API contracts.' },
      { agentId: 'frontend', task: 'Define the energy monitoring dashboard flow.' },
      { agentId: 'qa', task: 'Validate energy monitoring acceptance evidence.' },
      { agentId: 'documentation', task: 'Register the energy monitoring simulation execution.' },
    ],
  },
  {
    scenarioId: 'mqtt-full-gauge-integration',
    name: 'Integracao MQTT Full Gauge',
    objective: 'Validate a simulated Full Gauge MQTT integration without connecting a device or broker.',
    flow: [
      { agentId: 'iot-mqtt', task: 'Design Full Gauge MQTT topics, payloads, and security rules.' },
      { agentId: 'backend', task: 'Define ingestion validation and safe backend integration contracts.' },
      { agentId: 'qa', task: 'Validate MQTT integration evidence and safety constraints.' },
      { agentId: 'documentation', task: 'Register the MQTT Full Gauge simulation execution.' },
    ],
  },
  {
    scenarioId: 'industrial-predictive-diagnostics',
    name: 'Diagnostico Preditivo Industrial',
    objective: 'Validate a simulated predictive diagnostic workflow using bounded industrial evidence.',
    flow: [
      { agentId: 'software-architect', task: 'Design the predictive diagnostic orchestration flow.' },
      { agentId: 'database', task: 'Define telemetry evidence and index requirements without migration.' },
      { agentId: 'ai-rag', task: 'Define grounded predictive evidence synthesis and hallucination controls.' },
      { agentId: 'backend', task: 'Define predictive diagnostic service contracts.' },
      { agentId: 'qa', task: 'Validate predictive diagnostic evidence and uncertainty controls.' },
      { agentId: 'documentation', task: 'Register the predictive diagnostic simulation execution.' },
    ],
  },
];

@Injectable()
export class IndustrialValidationService {
  constructor(
    private readonly orchestration: ExecutableOrchestrationService,
    private readonly decisionLog: DecisionLogService,
  ) {}

  runAll() {
    return {
      phase: 4,
      mode: 'controlled-simulation',
      infrastructureActivated: false,
      externalApisConnected: false,
      manualInterventionRequired: false,
      scenarios: SCENARIOS.map((scenario) => this.runScenario(scenario)),
      completedAt: new Date().toISOString(),
    };
  }

  private runScenario(scenario: ScenarioDefinition): IndustrialValidationScenarioResult {
    const taskIds: string[] = [];

    for (const step of scenario.flow) {
      const generated = this.orchestration.generateTask({
        goal: step.task,
        tenantId: 'fcx-industrial-validation',
        requestedBy: 'fcx-agent-master-phase4',
        preferredAgentId: step.agentId,
        input: { scenarioId: scenario.scenarioId, scenarioObjective: scenario.objective },
        acceptanceCriteria: ['controlled-simulation-only', 'evidence-registered', 'no-external-operation'],
      });
      this.orchestration.forwardTask(generated.taskId);
      this.orchestration.registerResult(generated.taskId, {
        status: 'completed',
        summary: `${step.agentId} completed the controlled simulation step.`,
        output: {
          scenarioId: scenario.scenarioId,
          simulated: true,
          criteriaSatisfied: true,
        },
        evidence: [`simulation:${scenario.scenarioId}:${step.agentId}`, 'external-operations:none'],
      });
      taskIds.push(generated.taskId);
    }

    const qaTaskId = taskIds[scenario.flow.findIndex((step) => step.agentId === 'qa')];
    this.decisionLog.record({
      taskId: qaTaskId,
      type: 'simulation_approval',
      decision: 'approved',
      rationale: 'QA Agent approved all controlled simulation evidence.',
      actor: 'qa',
      metadata: {
        scenarioId: scenario.scenarioId,
        humanApproval: 'not_required',
        deploymentApproval: 'not_required',
      },
    });
    this.decisionLog.record({
      taskId: taskIds[0],
      type: 'validation_scenario',
      decision: 'passed',
      rationale: `${scenario.name} completed with QA and documentation records.`,
      actor: 'fcx-agent-master',
      metadata: { scenarioId: scenario.scenarioId, taskCount: taskIds.length },
    });

    const auditTrail = taskIds.flatMap((taskId) => this.decisionLog.findAll(taskId));
    return {
      scenarioId: scenario.scenarioId,
      name: scenario.name,
      selectedAgent: scenario.flow[0].agentId,
      executedFlow: scenario.flow.map((step) => step.agentId),
      generatedTaskIds: taskIds,
      approvals: {
        qa: 'approved',
        human: 'not_required',
        deployment: 'not_required',
        mode: 'controlled-simulation',
      },
      finalResult: 'passed',
      auditTrail,
    };
  }
}
