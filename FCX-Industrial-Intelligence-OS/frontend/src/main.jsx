import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AlarmTriangle,
  BarChart3,
  BrainCircuit,
  Boxes,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  RadioTower,
} from 'lucide-react';
import './style.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const navigation = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/predictive', label: 'Predictive', icon: BrainCircuit },
  { path: '/assets', label: 'Assets', icon: Boxes },
  { path: '/telemetry', label: 'Telemetry', icon: RadioTower },
  { path: '/alarms', label: 'Alarms', icon: AlarmTriangle },
  { path: '/work-orders', label: 'Work Orders', icon: ClipboardList },
  { path: '/integrations', label: 'Integrations', icon: Activity },
];

const formatNumber = (value, decimals = 0) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(
    Number(value || 0),
  );

function useApi(path, fallback) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}${path}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = await response.json();
        if (active) {
          setData(payload);
          setError('');
        }
      } catch (err) {
        if (active) {
          setError('API indisponivel. Exibindo estado local.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [path]);

  return { data, loading, error };
}

function App() {
  const [route, setRoute] = useState(window.location.pathname === '/' ? '/dashboard' : window.location.pathname);

  function navigate(path) {
    window.history.pushState({}, '', path);
    setRoute(path);
  }

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname === '/' ? '/dashboard' : window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const page = {
    '/dashboard': <DashboardPage />,
    '/predictive': <PredictivePage />,
    '/assets': <AssetsPage />,
    '/telemetry': <TelemetryPage />,
    '/alarms': <AlarmsPage />,
    '/work-orders': <WorkOrdersPage />,
    '/integrations': <IntegrationsPage />,
  }[route] || <DashboardPage />;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <Gauge size={28} />
          <div>
            <strong>FCX</strong>
            <span>Industrial OS</span>
          </div>
        </div>
        <nav>
          {navigation.map(({ path, label, icon: Icon }) => (
            <button className={route === path ? 'active' : ''} key={path} onClick={() => navigate(path)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="content">{page}</main>
    </div>
  );
}

function PredictivePage() {
  const fallback = {
    kpis: {
      averageHealthScore: 0,
      criticalAssets: 0,
      anomalies: 0,
      failureTrendAssets: 0,
      maxFailureRisk: 0,
    },
    widgets: {
      healthScoreByAsset: [],
      topCriticalAssets: [],
      failureRisk: [],
      failureTrends: [],
      predictedConsumption: [],
      predictedTemperature: [],
      anomalies: [],
    },
  };
  const { data, loading, error } = useApi('/predictive/dashboard', fallback);
  const kpis = data.kpis || fallback.kpis;
  const widgets = data.widgets || fallback.widgets;

  return (
    <>
      <PageHeader title="Predictive Intelligence" subtitle="Health score, falhas provaveis, anomalias e previsoes operacionais." />
      <StatusLine loading={loading} error={error} />
      <section className="kpiGrid">
        <Kpi label="Health Score medio" value={formatNumber(kpis.averageHealthScore, 1)} />
        <Kpi label="Risco de Falha" value={`${formatNumber(kpis.maxFailureRisk, 0)}%`} tone="danger" />
        <Kpi label="Ativos criticos" value={kpis.criticalAssets} tone="danger" />
        <Kpi label="Anomalias detectadas" value={kpis.anomalies} tone="warning" />
        <Kpi label="Tendencia de falha" value={kpis.failureTrendAssets} tone="danger" />
      </section>
      <section className="widgetGrid predictiveGrid">
        <HealthScoreByAssetWidget data={widgets.healthScoreByAsset} />
        <FailureRiskWidget data={widgets.failureRisk} />
        <CriticalPredictiveAssetsWidget data={widgets.topCriticalAssets} />
        <FailureTrendWidget data={widgets.failureTrends} />
        <TrendWidget title="Consumo previsto" data={widgets.predictedConsumption} suffix="kW" />
        <TrendWidget title="Temperatura prevista" data={widgets.predictedTemperature} suffix="C" />
        <PredictiveAnomaliesWidget data={widgets.anomalies} />
      </section>
    </>
  );
}

function DashboardPage() {
  const fallback = {
    kpis: {
      ativosMonitorados: 0,
      alarmesAtivos: 0,
      temperaturaMedia: 0,
      vibracaoMedia: 0,
      consumoEnergetico: 0,
      ordensAbertas: 0,
    },
    widgets: {
      saudeAtivos: [],
      alarmesCriticos: [],
      tendenciaTemperatura: [],
      tendenciaVibracao: [],
      consumoEnergetico: [],
      rankingAtivosCriticos: [],
    },
  };
  const { data, loading, error } = useApi('/dashboards', fallback);
  const kpis = data.kpis || fallback.kpis;
  const widgets = data.widgets || fallback.widgets;

  return (
    <>
      <PageHeader title="Dashboard executivo" subtitle="Operacao industrial, telemetria e manutencao em uma visao unica." />
      <StatusLine loading={loading} error={error} />
      <section className="kpiGrid">
        <Kpi label="Ativos monitorados" value={kpis.ativosMonitorados} />
        <Kpi label="Alarmes ativos" value={kpis.alarmesAtivos} tone="danger" />
        <Kpi label="Temperatura media" value={`${formatNumber(kpis.temperaturaMedia, 1)} C`} />
        <Kpi label="Vibracao media" value={`${formatNumber(kpis.vibracaoMedia, 2)} mm/s`} />
        <Kpi label="Consumo energetico" value={`${formatNumber(kpis.consumoEnergetico, 1)} kW`} />
        <Kpi label="Ordens abertas" value={kpis.ordensAbertas} tone="warning" />
      </section>
      <section className="widgetGrid">
        <HealthWidget data={widgets.saudeAtivos} />
        <CriticalAlarmsWidget data={widgets.alarmesCriticos} />
        <TrendWidget title="Tendencia de temperatura" data={widgets.tendenciaTemperatura} suffix="C" />
        <TrendWidget title="Tendencia de vibracao" data={widgets.tendenciaVibracao} suffix="mm/s" />
        <TrendWidget title="Consumo energetico" data={widgets.consumoEnergetico} suffix="kW" />
        <CriticalAssetsWidget data={widgets.rankingAtivosCriticos} />
      </section>
    </>
  );
}

function AssetsPage() {
  const { data, loading, error } = useApi('/assets', []);
  return (
    <>
      <PageHeader title="Assets" subtitle="Inventario industrial monitorado pelo FCX." />
      <StatusLine loading={loading} error={error} />
      <DataTable
        columns={['nome', 'tipo', 'fabricante', 'modelo', 'unidade', 'criticidade', 'status']}
        rows={data}
      />
    </>
  );
}

function TelemetryPage() {
  const { data, loading, error } = useApi('/telemetry?limit=250', []);
  return (
    <>
      <PageHeader title="Telemetry" subtitle="Ultimas leituras operacionais dos ativos." />
      <StatusLine loading={loading} error={error} />
      <DataTable
        columns={['asset', 'timestamp', 'temperatura', 'vibracao', 'corrente', 'tensao', 'potencia']}
        rows={data.map((item) => ({ ...item, asset: item.asset?.nome || item.assetId }))}
      />
    </>
  );
}

function AlarmsPage() {
  const { data, loading, error } = useApi('/alarms', []);
  return (
    <>
      <PageHeader title="Alarms" subtitle="Alarmes ativos, reconhecidos e resolvidos." />
      <StatusLine loading={loading} error={error} />
      <DataTable
        columns={['asset', 'severidade', 'titulo', 'status', 'timestamp']}
        rows={data.map((item) => ({ ...item, asset: item.asset?.nome || item.assetId }))}
      />
    </>
  );
}

function WorkOrdersPage() {
  const { data, loading, error } = useApi('/work-orders', []);
  return (
    <>
      <PageHeader title="Work Orders" subtitle="Execucao de manutencao e intervencoes tecnicas." />
      <StatusLine loading={loading} error={error} />
      <DataTable
        columns={['numeroOs', 'ativo', 'tecnico', 'prioridade', 'status', 'dataAbertura']}
        rows={data.map((item) => ({ ...item, ativo: item.ativo?.nome || item.assetId }))}
      />
    </>
  );
}

function IntegrationsPage() {
  const { data, loading, error } = useApi('/integrations', { connectors: [] });
  const architecture = useApi('/acquisition/architecture', { flow: [], tables: [], services: [], connectors: [] });

  return (
    <>
      <PageHeader title="Integrations" subtitle="Conectores industriais, aquisicao de dados e pipeline operacional." />
      <StatusLine loading={loading || architecture.loading} error={error || architecture.error} />
      <section className="widgetGrid">
        <Widget title="Conectores">
          <div className="eventList">
            {(data.connectors || []).map((connector) => (
              <div key={connector.id}>
                <strong>{connector.name}</strong>
                <span>{connector.status}</span>
              </div>
            ))}
          </div>
        </Widget>
        <Widget title="Pipeline de aquisicao">
          <div className="eventList">
            {(architecture.data.flow || []).map((layer) => (
              <div key={layer}>
                <strong>{layer}</strong>
                <span>ativo na arquitetura FCX</span>
              </div>
            ))}
          </div>
        </Widget>
        <Widget title="Tabelas industriais">
          <div className="eventList">
            {(architecture.data.tables || []).map((table) => (
              <div key={table}>
                <strong>{table}</strong>
                <span>PostgreSQL / TimescaleDB</span>
              </div>
            ))}
          </div>
        </Widget>
      </section>
    </>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <header className="pageHeader">
      <div>
        <span className="eyebrow">FCX Industrial Intelligence OS</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="liveBadge">
        <Activity size={18} />
        MVP operacional
      </div>
    </header>
  );
}

function StatusLine({ loading, error }) {
  if (loading) {
    return <div className="notice">Carregando dados operacionais...</div>;
  }
  if (error) {
    return <div className="notice warning">{error}</div>;
  }
  return null;
}

function Kpi({ label, value, tone = 'normal' }) {
  return (
    <article className={`kpi ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function HealthWidget({ data }) {
  const total = data.reduce((sum, item) => sum + item.total, 0) || 1;
  return (
    <Widget title="Saude dos ativos">
      <div className="healthList">
        {data.map((item) => (
          <div key={item.status}>
            <span>{item.status}</span>
            <div className="bar">
              <i style={{ width: `${(item.total / total) * 100}%` }} />
            </div>
            <strong>{item.total}</strong>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function CriticalAlarmsWidget({ data }) {
  return (
    <Widget title="Alarmes criticos">
      <div className="eventList">
        {data.length === 0 ? <span>Nenhum alarme critico ativo.</span> : null}
        {data.slice(0, 8).map((alarm) => (
          <div key={alarm.id}>
            <strong>{alarm.titulo}</strong>
            <span>{alarm.asset?.nome} - {alarm.severidade}</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function TrendWidget({ title, data, suffix }) {
  const values = data.slice(-30).map((item) => Number(item.value || 0));
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 100;
    const y = 42 - (value / max) * 38;
    return `${x},${y}`;
  });
  const latest = values[values.length - 1] || 0;

  return (
    <Widget title={title}>
      <div className="trendValue">{formatNumber(latest, 2)} {suffix}</div>
      <svg className="sparkline" viewBox="0 0 100 46" preserveAspectRatio="none">
        <polyline points={points.join(' ')} />
      </svg>
    </Widget>
  );
}

function CriticalAssetsWidget({ data }) {
  return (
    <Widget title="Ranking de ativos criticos">
      <div className="eventList">
        {data.slice(0, 8).map((asset) => (
          <div key={asset.id}>
            <strong>{asset.nome}</strong>
            <span>{asset.criticidade} - {asset.status} - {asset._count?.alarms || 0} alarmes</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function HealthScoreByAssetWidget({ data }) {
  return (
    <Widget title="Health Score por ativo">
      <div className="scoreList">
        {data.slice(0, 12).map((asset) => (
          <div key={asset.assetId}>
            <span>{asset.assetName}</span>
            <div className="bar scoreBar">
              <i style={{ width: `${asset.healthScore}%` }} />
            </div>
            <strong className={asset.classification}>{asset.healthScore}</strong>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function CriticalPredictiveAssetsWidget({ data }) {
  return (
    <Widget title="Top 10 ativos criticos">
      <div className="eventList">
        {data.slice(0, 10).map((asset) => (
          <div key={asset.assetId}>
            <strong>{asset.assetName}</strong>
            <span>Score {asset.healthScore} - {asset.classification} - {asset.failureTrend?.status}</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function FailureRiskWidget({ data }) {
  return (
    <Widget title="Risco de Falha">
      <div className="eventList">
        {data.slice(0, 10).map((item) => (
          <div key={item.assetId}>
            <strong>{item.assetName}</strong>
            <span>
              {item.riskScore}% - {item.riskLevel} - RF {item.models?.randomForestRisk}% - XGB {item.models?.xgboostRisk}%
            </span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function FailureTrendWidget({ data }) {
  return (
    <Widget title="Tendencia de falhas">
      <div className="eventList">
        {data.slice(0, 10).map((item) => (
          <div key={item.assetId}>
            <strong>{item.assetName}</strong>
            <span>{item.status} - confianca {formatNumber(item.confidence, 1)}% - slope {item.slope}</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function PredictiveAnomaliesWidget({ data }) {
  return (
    <Widget title="Anomalias detectadas">
      <div className="eventList">
        {data.length === 0 ? <span>Nenhuma anomalia detectada.</span> : null}
        {data.slice(0, 10).map((item, index) => (
          <div key={`${item.assetId}-${item.timestamp}-${index}`}>
            <strong>{item.assetName}</strong>
            <span>{item.type} - {item.severity} - {formatCell(item.value)}</span>
          </div>
        ))}
      </div>
    </Widget>
  );
}

function Widget({ title, children }) {
  return (
    <article className="widget">
      <h2>{title}</h2>
      {children}
    </article>
  );
}

function DataTable({ columns, rows }) {
  const safeRows = useMemo(() => rows.slice(0, 250), [rows]);

  return (
    <section className="tableWrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeRows.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => (
                <td key={column}>{formatCell(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function formatCell(value) {
  if (value === null || value === undefined) {
    return '-';
  }
  if (value instanceof Date) {
    return value.toLocaleString('pt-BR');
  }
  if (typeof value === 'string' && value.includes('T') && value.includes(':')) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('pt-BR');
    }
  }
  if (typeof value === 'number') {
    return formatNumber(value, 2);
  }
  return String(value);
}

createRoot(document.getElementById('root')).render(<App />);
