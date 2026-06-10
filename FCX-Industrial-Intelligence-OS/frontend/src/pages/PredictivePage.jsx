import { useApiResource } from '../api';
import { EmptyState, Kpi, PageHeader, Panel, ResourceState, Sparkline, StatusPill, formatNumber } from '../components/Common';

export default function PredictivePage() {
  const resource = useApiResource('/predictive/dashboard', { kpis: {}, widgets: {} });
  const { kpis = {}, widgets = {} } = resource.data;

  return <>
    <PageHeader eyebrow="FCX AI ENGINE" title="Inteligência preditiva" subtitle="Risco de falha, anomalias e tendências para antecipar intervenções." resource={resource} />
    <ResourceState resource={resource} />
    <section className="kpiGrid">
      <Kpi label="Health score médio" value={formatNumber(kpis.averageHealthScore, 1)} detail="condição da planta" />
      <Kpi label="Risco máximo de falha" value={`${formatNumber(kpis.maxFailureRisk)}%`} tone="danger" detail="maior risco calculado" />
      <Kpi label="Ativos críticos" value={kpis.criticalAssets || 0} tone="danger" detail="ação recomendada" />
      <Kpi label="Anomalias" value={kpis.anomalies || 0} tone="warning" detail="padrões fora da curva" />
      <Kpi label="Tendências de falha" value={kpis.failureTrendAssets || 0} tone="warning" detail="degradação identificada" />
    </section>
    <section className="panelGrid predictive">
      <Panel title="Health score por ativo" subtitle="Classificação da condição operacional" className="wide">
        <div className="scoreList">{(widgets.healthScoreByAsset || []).length ? widgets.healthScoreByAsset.slice(0, 12).map((item) => <div key={item.assetId}><span>{item.assetName}</span><div className="bar"><i style={{ width: `${item.healthScore}%` }} /></div><strong>{item.healthScore}</strong><StatusPill value={item.classification} /></div>) : <EmptyState />}</div>
      </Panel>
      <Panel title="Risco de falha" subtitle="Modelos combinados">
        <div className="eventList">{(widgets.failureRisk || []).length ? widgets.failureRisk.slice(0, 10).map((item) => <div key={item.assetId}><strong>{item.assetName} · {item.riskScore}%</strong><span>{item.riskLevel} · RF {item.models?.randomForestRisk}% · XGB {item.models?.xgboostRisk}%</span></div>) : <EmptyState />}</div>
      </Panel>
      <Panel title="Anomalias detectadas" subtitle="Eventos recentes">
        <div className="eventList">{(widgets.anomalies || []).length ? widgets.anomalies.slice(0, 10).map((item, index) => <div key={`${item.assetId}-${index}`}><strong>{item.assetName}</strong><span>{item.type} · {item.severity} · {formatNumber(item.value, 2)}</span></div>) : <EmptyState message="Nenhuma anomalia detectada." />}</div>
      </Panel>
      <Panel title="Consumo previsto" subtitle="Projeção do modelo"><Sparkline data={widgets.predictedConsumption || []} suffix="kW" /></Panel>
      <Panel title="Temperatura prevista" subtitle="Projeção do modelo"><Sparkline data={widgets.predictedTemperature || []} suffix="°C" /></Panel>
    </section>
  </>;
}
