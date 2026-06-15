import { useApiResource } from '../api';
import { EmptyState, Kpi, PageHeader, Panel, ResourceState } from '../components/Common';

const fallback = {
  mode: 'local-operational',
  agents: [],
  workflows: { total: 0, running: 0, completed: 0, failed: 0 },
  queue: { total: 0, queued: 0, running: 0, completed: 0, failed: 0 },
  metrics: { workflowsExecuted: 0, tasksExecuted: 0, tasksFailed: 0, tokensConsumed: 0, activeAgents: [] },
  reports: [],
};

export default function AgentRuntimePage() {
  const resource = useApiResource('/api/agent-runtime/dashboard', fallback);
  const { agents = [], workflows = {}, queue = {}, metrics = {}, reports = [] } = resource.data;

  return (
    <>
      <PageHeader title="Agent Runtime" subtitle="Fila, agentes e resultados do FCX Agent Operating System." resource={resource} />
      <ResourceState resource={resource} />
      <section className="kpiGrid">
        <Kpi label="Workflows executados" value={metrics.workflowsExecuted || 0} />
        <Kpi label="Workflows concluidos" value={workflows.completed || 0} />
        <Kpi label="Tarefas executadas" value={metrics.tasksExecuted || 0} />
        <Kpi label="Falhas" value={metrics.tasksFailed || 0} tone="danger" />
        <Kpi label="Fila pendente" value={queue.queued || 0} tone="warning" />
        <Kpi label="Agentes ativos" value={(metrics.activeAgents || []).length} />
      </section>
      <section className="panelGrid">
        <Panel title="Agent Registry" subtitle="Especialistas disponiveis para orquestracao">
          <div className="eventList">
            {agents.length ? agents.map((agent) => (
              <div key={agent.id}><strong>{agent.id}</strong><span>{agent.status} - {(agent.capabilities || []).join(', ')}</span></div>
            )) : <EmptyState message="Nenhum agente registrado." />}
          </div>
        </Panel>
        <Panel title="Execution Queue" subtitle="Estado atual do processamento">
          <div className="eventList">
            <div><strong>{queue.completed || 0} concluidas</strong><span>{queue.running || 0} executando</span></div>
            <div><strong>{queue.queued || 0} aguardando</strong><span>{queue.failed || 0} falhas</span></div>
          </div>
        </Panel>
        <Panel title="Execution Reports" subtitle="Execucoes mais recentes">
          <div className="eventList">
            {reports.length ? reports.slice(-8).reverse().map((report) => (
              <div key={report.workflow?.workflowId}><strong>{report.workflow?.name}</strong><span>{report.workflow?.status} - {(report.results || []).length} tarefas</span></div>
            )) : <EmptyState message="Nenhuma execucao registrada." />}
          </div>
        </Panel>
      </section>
    </>
  );
}
