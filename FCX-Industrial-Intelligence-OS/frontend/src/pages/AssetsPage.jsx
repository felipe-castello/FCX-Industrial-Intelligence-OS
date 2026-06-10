import { Plus, Save, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiRequest, useApiResource } from '../api';
import { DataTable, Kpi, PageHeader, ResourceState } from '../components/Common';

const initialForm = {
  siteId: '',
  name: '',
  type: 'RACK',
  manufacturer: '',
  model: '',
  serialNumber: '',
  criticality: 'MEDIUM',
  status: 'ONLINE',
};

export default function AssetsPage() {
  const assets = useApiResource('/assets', []);
  const sites = useApiResource('/sites', []);
  const sensors = useApiResource('/sensors', []);
  const gateways = useApiResource('/gateways', []);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const rows = useMemo(() => assets.data.map((asset) => ({
    ...asset,
    name: asset.name || asset.nome,
    type: asset.type || asset.tipo,
    manufacturer: asset.manufacturer || asset.fabricante,
    model: asset.model || asset.modelo,
    siteName: asset.site?.name || asset.location || asset.unidade,
    criticality: asset.criticality || asset.criticidade,
    sensorsCount: asset._count?.sensors || asset.sensors?.length || 0,
  })), [assets.data]);

  const online = rows.filter((asset) => asset.status === 'ONLINE').length;
  const offline = rows.filter((asset) => asset.status === 'OFFLINE').length;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiRequest('/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm(initialForm);
      setFormOpen(false);
      setMessage('Ativo cadastrado com sucesso.');
      assets.refresh();
    } catch (error) {
      setMessage('Não foi possível cadastrar o ativo. Verifique os campos e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="Gestão de ativos" subtitle="Cadastro e visão operacional dos equipamentos industriais." resource={assets} />
      <ResourceState resource={assets} />
      {message ? <div className="notice">{message}</div> : null}

      <section className="kpiGrid assetSummary">
        <Kpi label="Ativos" value={rows.length} detail="equipamentos cadastrados" />
        <Kpi label="Sensores" value={sensors.data.length} detail="pontos de medição" />
        <Kpi label="Gateways" value={gateways.data.length} detail="concentradores de dados" />
        <Kpi label="Online" value={online} detail="em operação" />
        <Kpi label="Offline" value={offline} detail="sem comunicação" tone={offline ? 'danger' : 'normal'} />
      </section>

      <div className="assetToolbar">
        <div>
          <strong>Inventário industrial</strong>
          <span>{rows.length} ativos em {sites.data.length} sites</span>
        </div>
        <button className="primaryButton" onClick={() => setFormOpen((open) => !open)}>
          {formOpen ? <X size={16} /> : <Plus size={16} />}
          {formOpen ? 'Fechar' : 'Cadastrar ativo'}
        </button>
      </div>

      {formOpen ? (
        <form className="assetForm" onSubmit={submit}>
          <label>Site<select required value={form.siteId} onChange={(event) => update('siteId', event.target.value)}><option value="">Selecione o site</option>{sites.data.map((site) => <option key={site.id} value={site.id}>{site.name}</option>)}</select></label>
          <label>Nome<input required value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex.: Compressor 01" /></label>
          <label>Tipo<select value={form.type} onChange={(event) => update('type', event.target.value)}>{['COMPRESSOR', 'RACK', 'COLD_ROOM', 'EVAPORATOR', 'CONDENSER', 'PANEL', 'PUMP', 'FAN', 'OTHER'].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Fabricante<input value={form.manufacturer} onChange={(event) => update('manufacturer', event.target.value)} /></label>
          <label>Modelo<input value={form.model} onChange={(event) => update('model', event.target.value)} /></label>
          <label>Número de série<input value={form.serialNumber} onChange={(event) => update('serialNumber', event.target.value)} /></label>
          <label>Criticidade<select value={form.criticality} onChange={(event) => update('criticality', event.target.value)}>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Status<select value={form.status} onChange={(event) => update('status', event.target.value)}>{['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ALARM'].map((value) => <option key={value}>{value}</option>)}</select></label>
          <button className="primaryButton formSubmit" disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar ativo'}</button>
        </form>
      ) : null}

      <DataTable
        columns={[
          { key: 'name', label: 'Ativo' },
          { key: 'type', label: 'Tipo' },
          { key: 'manufacturer', label: 'Fabricante' },
          { key: 'model', label: 'Modelo' },
          { key: 'serialNumber', label: 'Série' },
          { key: 'siteName', label: 'Site' },
          { key: 'sensorsCount', label: 'Sensores' },
          { key: 'criticality', label: 'Criticidade', status: true },
          { key: 'status', label: 'Status', status: true },
        ]}
        rows={rows}
        emptyMessage="Nenhum ativo cadastrado. Cadastre o primeiro equipamento industrial."
      />
    </>
  );
}
