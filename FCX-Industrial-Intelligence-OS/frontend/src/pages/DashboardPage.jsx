import { useApiResource } from '../api';
import { EmptyState, Kpi, PageHeader, Panel, ResourceState, Sparkline, StatusPill, formatNumber } from '../components/Common';

const fallback = { kpis: {}, widgets: {} };

export default function DashboardPage() {
  const resource = useApiResource('/dashboards', fallback);
  const { kpis = {}, widgets = {} } = resource.data;
  const healthRows = widgets.saudeAtivos || [];
  const total = healthRows.reduce((sum, item) => sum + item.total, 0) || 1;

  return (
    <>
      <PageHeader title="Dashboard executivo" subtitle="Indicadores críticos para decisão e continuidade operacional." resource={resource} />
      <ResourceState resource={resource} />
      <section className="kpiGrid">
        <Kpi label="Ativos monitorados" value={kpis.ativosMonitorados || 0} detail="inventário conectado" />
        <Kpi label="Alarmes ativos" value={kpis.alarmesAtivos || 0} detail="requerem atenção" tone="danger" />
        <Kpi label="Temperatura média" value={`${formatNumber(kpis.temperaturaMedia, 1)} °C`} detail="janela operacional" />
        <Kpi label="Vibração média" value={`${formatNumber(kpis.vibracaoMedia, 2)} mm/s`} detail="condição mecânica" />
        <Kpi label="Consumo médio" value={`${formatNumber(kpis.consumoEnergetico, 1)} kW`} detail="demanda energética" />
        <Kpi label="Ordens abertas" value={kpis.ordensAbertas || 0} detail="fila de manutenção" tone="warning" />
      </section>
      <section className="panelGrid">
        <Panel title="Saúde dos ativos" subtitle="Distribuição por estado operacional">
          <div className="healthList">{healthRows.length ? healthRows.map((item) => <div key={item.status}><StatusPill value={item.status} /><div className="bar"><i style={{ width: `${(item.total / total) * 100}%` }} /></div><strong>{item.total}</strong></div>) : <EmptyState />}</div>
        </Panel>
        <Panel title="Alarmes críticos" subtitle="Eventos ativos de maior severidade">
          <div className="eventList">{(widgets.alarmesCriticos || []).length ? widgets.alarmesCriticos.map((item) => <div key={item.id}><strong>{item.titulo}</strong><span>{item.asset?.nome || 'Ativo'} · {item.severidade}</span></div>) : <EmptyState message="Nenhum alarme crítico ativo." />}</div>
        </Panel>
        <Panel title="Temperatura" subtitle="Tendência recente"><Sparkline data={widgets.tendenciaTemperatura || []} suffix="°C" /></Panel>
        <Panel title="Vibração" subtitle="Tendência recente"><Sparkline data={widgets.tendenciaVibracao || []} suffix="mm/s" /></Panel>
        <Panel title="Consumo energético" subtitle="Tendência recente"><Sparkline data={widgets.consumoEnergetico || []} suffix="kW" /></Panel>
        <Panel title="Ativos críticos" subtitle="Prioridade por criticidade">
          <div className="eventList">{(widgets.rankingAtivosCriticos || []).length ? widgets.rankingAtivosCriticos.map((item) => <div key={item.id}><strong>{item.nome}</strong><span>{item.criticidade} · {item.status} · {item._count?.alarms || 0} alarmes</span></div>) : <EmptyState />}</div>
        </Panel>
      </section>
    </>
  );
}
