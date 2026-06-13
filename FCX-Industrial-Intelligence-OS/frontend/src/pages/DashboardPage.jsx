import { useState } from 'react';
import { useApiResource, withCompany } from '../api';
import { EmptyState, Kpi, PageHeader, Panel, ResourceState, Sparkline, StatusPill, WAITING_FOR_DEVICES, formatNumber } from '../components/Common';

const fallback = { kpis: {}, widgets: {} };

export default function DashboardPage({ activeCompanyId, companies }) {
  const [filters, setFilters] = useState({ clientId: '', siteId: '', assetId: '', deviceId: '' });
  const clients = useApiResource('/clients', []);
  const sites = useApiResource(withCompany('/sites', activeCompanyId), []);
  const assetsForFilter = useApiResource(withCompany('/assets', activeCompanyId), []);
  const devices = useApiResource('/devices', []);
  const dashboardPath = Object.entries(filters).reduce((path, [key, value]) => value ? `${path}${path.includes('?') ? '&' : '?'}${key}=${encodeURIComponent(value)}` : path, withCompany('/dashboards', activeCompanyId));
  const resource = useApiResource(dashboardPath, fallback);
  const assets = useApiResource(withCompany('/assets', activeCompanyId), []);
  const alarms = useApiResource(withCompany('/alarms', activeCompanyId), []);
  const { kpis = {}, widgets = {} } = resource.data;
  const monitoredAssets = Array.isArray(assets.data) ? assets.data.length : 0;
  const activeAlarms = Array.isArray(alarms.data) ? alarms.data.filter((alarm) => alarm.status === 'ACTIVE').length : 0;
  const healthRows = widgets.saudeAtivos || [];
  const total = healthRows.reduce((sum, item) => sum + item.total, 0) || 1;
  const activeCompany = companies.data.find((company) => company.id === activeCompanyId);

  return (
    <>
      <PageHeader title="Dashboard executivo" subtitle={`Empresa ativa: ${activeCompany?.name || 'carregando...'} · Indicadores críticos para decisão e continuidade operacional.`} resource={resource} />
      <ResourceState resource={resource} />
      <section className="dashboardFilters">
        {[['clientId', 'Cliente', clients.data], ['siteId', 'Unidade', sites.data], ['assetId', 'Ativo', assetsForFilter.data.map((item) => ({ ...item, name: item.name || item.nome }))], ['deviceId', 'Dispositivo', devices.data]].map(([key, label, options]) => <label key={key}><span>{label}</span><select value={filters[key]} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))}><option value="">Todos</option>{options.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>)}
        <button className="refreshButton" onClick={() => setFilters({ clientId: '', siteId: '', assetId: '', deviceId: '' })}>Limpar filtros</button>
      </section>
      <section className="kpiGrid">
        <Kpi label="Ativos monitorados" value={monitoredAssets || kpis.assetsCount || kpis.ativosMonitorados || 0} detail="inventário conectado" />
        <Kpi label="Sensores" value={kpis.sensorsCount || 0} detail="pontos cadastrados" />
        <Kpi label="Gateways" value={kpis.gatewaysCount || 0} detail="concentradores" />
        <Kpi label="Ativos online" value={kpis.onlineAssets || 0} detail="em operação" />
        <Kpi label="Ativos offline" value={kpis.offlineAssets || 0} detail="sem comunicação" tone={kpis.offlineAssets ? 'danger' : 'normal'} />
        <Kpi label="Alarmes ativos" value={activeAlarms} detail="requerem atenção" tone="danger" />
        <Kpi label="Temperatura média" value={`${formatNumber(kpis.temperaturaMedia, 1)} °C`} detail="janela operacional" />
        <Kpi label="Vibração média" value={`${formatNumber(kpis.vibracaoMedia, 2)} mm/s`} detail="condição mecânica" />
        <Kpi label="Consumo médio" value={`${formatNumber(kpis.consumoEnergetico, 1)} kW`} detail="demanda energética" />
        <Kpi label="Ordens abertas" value={kpis.ordensAbertas || 0} detail="fila de manutenção" tone="warning" />
      </section>
      {!resource.error && !resource.loading && !monitoredAssets && !kpis.ativosMonitorados ? <div className="notice emptyNotice">{WAITING_FOR_DEVICES}</div> : null}
      <section className="panelGrid">
        <Panel title="Saúde dos ativos" subtitle="Distribuição por estado operacional">
          <div className="healthList">{healthRows.length ? healthRows.map((item) => <div key={item.status}><StatusPill value={item.status} /><div className="bar"><i style={{ width: `${(item.total / total) * 100}%` }} /></div><strong>{item.total}</strong></div>) : <EmptyState />}</div>
        </Panel>
        <Panel title="Alarmes críticos" subtitle="Eventos ativos de maior severidade">
          <div className="eventList">{(widgets.alarmesCriticos || []).length ? widgets.alarmesCriticos.map((item) => <div key={item.id}><strong>{item.titulo}</strong><span>{item.asset?.nome || 'Ativo'} · {item.severidade}</span></div>) : <EmptyState />}</div>
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
