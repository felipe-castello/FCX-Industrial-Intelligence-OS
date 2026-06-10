import { Cable, CheckCircle2, Database, RadioTower, Workflow } from 'lucide-react';
import { useApiResource } from '../api';
import { EmptyState, PageHeader, Panel, ResourceState, StatusPill, WAITING_FOR_DEVICES } from '../components/Common';

export default function IntegrationsPage() {
  const integrations = useApiResource('/integrations', { connectors: [] });
  const acquisition = useApiResource('/acquisition/architecture', { flow: [], tables: [], services: [], connectors: [] });
  const agents = useApiResource('/agents', { data: [], status: 'unknown' });

  return <>
    <PageHeader title="Integrações e aquisição" subtitle="Conectividade industrial, pipeline de dados e serviços inteligentes." resource={integrations} />
    <ResourceState resource={integrations} />
    {!integrations.error && !integrations.loading && !(integrations.data.connectors || []).length ? <div className="notice emptyNotice">{WAITING_FOR_DEVICES}</div> : null}
    <section className="integrationSummary">
      <div><Cable size={20} /><span>Conectores</span><strong>{integrations.data.connectors?.length || 0}</strong></div>
      <div><Workflow size={20} /><span>Etapas do pipeline</span><strong>{acquisition.data.flow?.length || 0}</strong></div>
      <div><Database size={20} /><span>Tabelas industriais</span><strong>{acquisition.data.tables?.length || 0}</strong></div>
      <div><RadioTower size={20} /><span>Agentes</span><StatusPill value={agents.data.status} /></div>
    </section>
    <section className="panelGrid">
      <Panel title="Conectores industriais" subtitle="Estado de configuração">
        <div className="connectorList">{(integrations.data.connectors || []).length ? integrations.data.connectors.map((item) => <div key={item.id}><CheckCircle2 size={17} /><span><strong>{item.name}</strong><small>{item.id}</small></span><StatusPill value={item.status} /></div>) : <EmptyState />}</div>
      </Panel>
      <Panel title="Pipeline de aquisição" subtitle="Fluxo do campo ao dashboard" className="wide">
        <div className="pipeline">{(acquisition.data.flow || []).length ? acquisition.data.flow.map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong></div>) : <EmptyState />}</div>
      </Panel>
      <Panel title="Serviços de aquisição" subtitle="Componentes disponíveis">
        <div className="tagList">{(acquisition.data.services || []).map((item) => <span key={item}>{item}</span>)}</div>
      </Panel>
      <Panel title="Armazenamento industrial" subtitle="Estruturas de persistência">
        <div className="eventList">{(acquisition.data.tables || []).map((item) => <div key={item}><strong>{item}</strong><span>PostgreSQL / TimescaleDB</span></div>)}</div>
      </Panel>
    </section>
  </>;
}
