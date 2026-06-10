import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useApiResource, withCompany } from '../api';
import { DataTable, Kpi, PageHeader, ResourceState, WAITING_FOR_DEVICES } from '../components/Common';

function SearchBar({ value, onChange, placeholder }) {
  return <label className="searchBox"><Search size={16} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function OperationalTablePage({ title, subtitle, path, columns, mapRow = (row) => row, metrics, activeCompanyId }) {
  const resource = useApiResource(withCompany(path, activeCompanyId), []);
  const [query, setQuery] = useState('');
  const rows = useMemo(() => resource.data.map(mapRow), [resource.data, mapRow]);
  const filtered = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())), [rows, query]);

  return <>
    <PageHeader title={title} subtitle={subtitle} resource={resource} />
    <ResourceState resource={resource} />
    <section className="kpiGrid compact">{metrics(rows).map((item) => <Kpi key={item.label} {...item} />)}</section>
    <div className="tableToolbar"><SearchBar value={query} onChange={setQuery} placeholder={`Buscar em ${title.toLowerCase()}...`} /><span>{filtered.length} registros</span></div>
    <DataTable columns={columns} rows={filtered} emptyMessage={query ? 'Nenhum registro corresponde à busca.' : 'Nenhum dispositivo conectado para esta empresa.'} />
  </>;
}

export function AssetsPage({ activeCompanyId }) {
  return <OperationalTablePage title="Ativos industriais" subtitle="Inventário, criticidade e condição operacional." path="/assets"
    columns={[{ key: 'nome', label: 'Ativo' }, { key: 'tipo', label: 'Tipo' }, { key: 'fabricante', label: 'Fabricante' }, { key: 'modelo', label: 'Modelo' }, { key: 'unidade', label: 'Unidade' }, { key: 'criticidade', label: 'Criticidade', status: true }, { key: 'status', label: 'Status', status: true }]}
    metrics={(rows) => [{ label: 'Total de ativos', value: rows.length }, { label: 'Críticos', value: rows.filter((x) => x.criticidade === 'CRITICAL').length, tone: 'danger' }, { label: 'Em alarme', value: rows.filter((x) => x.status === 'ALARM').length, tone: 'warning' }]} activeCompanyId={activeCompanyId} />;
}

export function AlarmsPage({ activeCompanyId }) {
  return <OperationalTablePage title="Gestão de alarmes" subtitle="Eventos ativos, reconhecidos e resolvidos." path="/alarms"
    mapRow={(row) => ({ ...row, assetName: row.asset?.nome || row.assetId })}
    columns={[{ key: 'assetName', label: 'Ativo' }, { key: 'severidade', label: 'Severidade', status: true }, { key: 'titulo', label: 'Alarme' }, { key: 'status', label: 'Status', status: true }, { key: 'timestamp', label: 'Data / hora' }]}
    metrics={(rows) => [{ label: 'Alarmes', value: rows.length }, { label: 'Ativos', value: rows.filter((x) => x.status === 'ACTIVE').length, tone: 'danger' }, { label: 'Críticos', value: rows.filter((x) => x.severidade === 'CRITICAL').length, tone: 'danger' }]} activeCompanyId={activeCompanyId} />;
}

export function TelemetryPage({ activeCompanyId }) {
  return <OperationalTablePage title="Telemetria" subtitle="Últimas leituras recebidas dos ativos conectados." path="/telemetry?limit=250"
    mapRow={(row) => ({ ...row, assetName: row.asset?.nome || row.assetId })}
    columns={[{ key: 'assetName', label: 'Ativo' }, { key: 'timestamp', label: 'Data / hora' }, { key: 'temperatura', label: 'Temperatura °C' }, { key: 'vibracao', label: 'Vibração mm/s' }, { key: 'corrente', label: 'Corrente A' }, { key: 'tensao', label: 'Tensão V' }, { key: 'potencia', label: 'Potência kW' }]}
    metrics={(rows) => [{ label: 'Leituras exibidas', value: rows.length }, { label: 'Ativos na janela', value: new Set(rows.map((x) => x.assetId)).size }, { label: 'Última leitura', value: rows[0]?.timestamp ? new Date(rows[0].timestamp).toLocaleTimeString('pt-BR') : '-' }]} activeCompanyId={activeCompanyId} />;
}

export function WorkOrdersPage({ activeCompanyId }) {
  return <OperationalTablePage title="Manutenção e ordens de serviço" subtitle="Planejamento e acompanhamento das intervenções técnicas." path="/work-orders"
    mapRow={(row) => ({ ...row, assetName: row.ativo?.nome || row.assetId })}
    columns={[{ key: 'numeroOs', label: 'Ordem' }, { key: 'assetName', label: 'Ativo' }, { key: 'tecnico', label: 'Técnico' }, { key: 'prioridade', label: 'Prioridade', status: true }, { key: 'status', label: 'Status', status: true }, { key: 'dataAbertura', label: 'Abertura' }]}
    metrics={(rows) => [{ label: 'Ordens', value: rows.length }, { label: 'Em aberto', value: rows.filter((x) => x.status === 'OPEN').length, tone: 'warning' }, { label: 'Urgentes', value: rows.filter((x) => x.prioridade === 'URGENT').length, tone: 'danger' }]} activeCompanyId={activeCompanyId} />;
}
