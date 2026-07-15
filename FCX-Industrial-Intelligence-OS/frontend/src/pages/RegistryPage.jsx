import { Eye, Pencil, Plus, Power, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, useApiResource, withCompany } from '../api';
import { PageHeader, ResourceState, StatusPill } from '../components/Common';

const configs = {
  companies: {
    title: 'Cadastro de empresas',
    path: '/companies',
    fields: ['name', 'document', 'contactName', 'contactEmail', 'contactPhone'],
    initial: { name: '', document: '', contactName: '', contactEmail: '', contactPhone: '', status: 'ACTIVE' },
    createLabel: 'Nova Empresa',
    required: ['name', 'document', 'contactName', 'contactEmail', 'contactPhone'],
    active: 'ACTIVE', inactive: 'INACTIVE',
  },
  clients: {
    title: 'Clientes',
    path: '/clients',
    fields: ['name', 'cnpj', 'email', 'phone', 'address', 'city', 'state'],
    initial: { name: '', cnpj: '', email: '', phone: '', address: '', city: '', state: '', status: 'ACTIVE' },
    createLabel: 'Novo Cliente',
    required: ['name', 'cnpj', 'email', 'phone', 'address', 'city', 'state'],
    active: 'ACTIVE', inactive: 'INACTIVE',
  },
  sites: {
    title: 'Unidades',
    path: '/sites',
    fields: ['clientId', 'name', 'address', 'city', 'state'],
    initial: { clientId: '', name: '', address: '', city: '', state: '', status: 'ACTIVE' },
    createLabel: 'Nova Unidade',
    required: ['clientId', 'name', 'address', 'city', 'state'],
    active: 'ACTIVE', inactive: 'INACTIVE',
  },
  assets: {
    title: 'Gestão cadastral de ativos',
    path: '/assets',
    fields: ['siteId', 'name', 'type', 'brand', 'model', 'location', 'criticality'],
    initial: { siteId: '', name: '', type: 'OTHER', brand: '', model: '', location: '', criticality: 'MEDIUM', status: 'ONLINE' },
    createLabel: 'Novo Ativo',
    required: ['siteId', 'name', 'type'],
    active: 'ONLINE', inactive: 'OFFLINE',
  },
  devices: {
    title: 'Dispositivos',
    path: '/devices',
    fields: ['assetId', 'name', 'serialNumber', 'deviceType', 'protocol'],
    initial: { assetId: '', name: '', serialNumber: '', deviceType: '', protocol: 'MQTT', status: 'ONLINE' },
    createLabel: 'Novo Dispositivo',
    required: ['assetId', 'name', 'serialNumber', 'deviceType', 'protocol'],
    active: 'ONLINE', inactive: 'INACTIVE',
  },
};

const labels = { clientId: 'Cliente', siteId: 'Unidade', assetId: 'Ativo', name: 'Nome', document: 'Documento', contactName: 'Contato', contactEmail: 'E-mail do contato', contactPhone: 'Telefone do contato', cnpj: 'CNPJ', email: 'E-mail', phone: 'Telefone', address: 'Endereço', city: 'Cidade', state: 'Estado', type: 'Tipo', brand: 'Marca', model: 'Modelo', location: 'Localização', criticality: 'Criticidade', serialNumber: 'Número de série', deviceType: 'Tipo de dispositivo', protocol: 'Protocolo' };

export function RegistryCrud({ kind, activeCompanyId, embedded = false }) {
  const config = configs[kind];
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const resourcePath = useMemo(() => {
    if (kind === 'devices') {
      return selectedAssetId ? `/devices?assetId=${encodeURIComponent(selectedAssetId)}` : '/devices';
    }
    return withCompany(config.path, activeCompanyId);
  }, [activeCompanyId, config.path, kind, selectedAssetId]);
  const resource = useApiResource(resourcePath, [], { enabled: kind !== 'devices' || Boolean(activeCompanyId && selectedAssetId) });
  const clients = useApiResource('/clients', []);
  const sites = useApiResource(withCompany('/sites', activeCompanyId), []);
  const assets = useApiResource(withCompany('/assets', activeCompanyId), []);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [form, setForm] = useState(config.initial);
  const [message, setMessage] = useState('');

  const lookups = useMemo(() => ({
    clientId: clients.data,
    siteId: sites.data,
    assetId: assets.data.map((item) => ({ ...item, name: item.name || item.nome })),
  }), [clients.data, sites.data, assets.data]);
  const activeCompanyAssetIds = useMemo(() => new Set(assets.data.map((asset) => asset.id)), [assets.data]);
  const rows = useMemo(() => (
    kind === 'devices'
      ? resource.data.filter((row) => activeCompanyAssetIds.has(row.assetId))
      : resource.data
  ), [activeCompanyAssetIds, kind, resource.data]);

  useEffect(() => {
    if (kind !== 'devices') return;
    if (!assets.data.length) {
      setSelectedAssetId('');
      return;
    }
    if (!selectedAssetId || !activeCompanyAssetIds.has(selectedAssetId)) {
      const firstAssetId = assets.data[0].id;
      setSelectedAssetId(firstAssetId);
      setForm((current) => ({ ...current, assetId: current.assetId || firstAssetId }));
    }
  }, [activeCompanyAssetIds, assets.data, kind, selectedAssetId]);

  function isRequired(field) {
    return config.required?.includes(field);
  }

  function fieldValue(field) {
    const value = form[field];
    return typeof value === 'string' ? value.trim() : value;
  }

  function openCreate() {
    setEditing('new');
    setViewing(null);
    setMessage('');
    setForm(kind === 'devices' ? { ...config.initial, assetId: selectedAssetId } : config.initial);
  }
  function openEdit(row) {
    setEditing(row.id);
    setViewing(null);
    setMessage('');
    if (kind === 'devices' && row.assetId) setSelectedAssetId(row.assetId);
    setForm(Object.fromEntries([...config.fields, 'status'].map((field) => [field, row[field] ?? config.initial[field] ?? ''])));
  }
  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    if (kind === 'devices' && field === 'assetId') setSelectedAssetId(value);
  }

  async function save(event) {
    event.preventDefault();
    if (kind === 'sites' && !activeCompanyId) {
      setMessage('Selecione uma empresa ativa antes de cadastrar a unidade.');
      return;
    }
    const missingField = config.fields.find((field) => isRequired(field) && !fieldValue(field));
    if (missingField) {
      setMessage(`Preencha o campo obrigatorio: ${labels[missingField] || missingField}.`);
      return;
    }

    const path = editing === 'new' ? config.path : `${config.path}/${editing}`;
    const relationshipFields = new Set(['clientId', 'siteId', 'assetId']);
    const payload = Object.fromEntries(
      [...config.fields, 'status']
        .map((field) => {
          const value = fieldValue(field);
          return [field, relationshipFields.has(field) && form[field] === '' ? null : value];
        })
        .filter(([, value]) => value !== '' && value !== undefined),
    );
    const scopedPayload = kind === 'sites' && activeCompanyId ? { ...payload, companyId: activeCompanyId } : payload;
    if (kind === 'devices' && !activeCompanyAssetIds.has(scopedPayload.assetId)) {
      setMessage('Selecione um ativo da empresa ativa antes de cadastrar o dispositivo.');
      return;
    }
    try {
      await apiRequest(path, { method: editing === 'new' ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scopedPayload) });
      if (kind === 'devices') setSelectedAssetId(scopedPayload.assetId);
      await resource.refresh();
      setEditing(null);
      setMessage('Registro salvo com sucesso.');
    } catch (error) {
      setMessage(error.message || 'Nao foi possivel salvar o registro.');
    }
  }

  async function setActive(row) {
    await apiRequest(`${config.path}/${row.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: row.status === config.inactive ? config.active : config.inactive }) });
    resource.refresh();
  }

  async function remove(row) {
    await apiRequest(`${config.path}/${row.id}`, { method: 'DELETE' });
    resource.refresh();
  }

  return <section className={embedded ? 'registryEmbedded' : ''}>
    {!embedded ? <PageHeader title={config.title} subtitle="Cadastro operacional com vínculos opcionais e compatibilidade preservada." resource={resource} /> : <h2>{config.title}</h2>}
    <ResourceState resource={resource} />
    {message ? <div className="notice">{message}</div> : null}
    <div className="assetToolbar">
      <span>{rows.length} registros</span>
      {kind === 'devices' ? <label>Ativo<select value={selectedAssetId} disabled={!assets.data.length} onChange={(event) => { setSelectedAssetId(event.target.value); setForm((current) => ({ ...current, assetId: event.target.value })); }}><option value="">{assets.data.length ? 'Selecione o ativo' : 'Nenhum ativo cadastrado'}</option>{lookups.assetId.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label> : null}
      <button className="primaryButton" onClick={openCreate}><Plus size={15} />{config.createLabel}</button>
    </div>
    {editing ? <form className="assetForm registryForm" onSubmit={save}>
      {config.fields.map((field) => <label key={field}>{labels[field] || field}{lookups[field] ? <select value={form[field] || ''} onChange={(event) => update(field, event.target.value)}><option value="">Sem vínculo</option>{lookups[field].map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select> : <input required={['name', 'cnpj', 'serialNumber'].includes(field)} value={form[field] || ''} onChange={(event) => update(field, event.target.value)} />}</label>)}
      <button className="primaryButton formSubmit"><Save size={15} />Salvar</button><button type="button" className="refreshButton formSubmit" onClick={() => setEditing(null)}><X size={15} />Cancelar</button>
    </form> : null}
    {viewing ? <div className="recordDetail"><strong>{viewing.name || viewing.nome}</strong><pre>{JSON.stringify(viewing, null, 2)}</pre></div> : null}
    <div className="tableWrap"><table><thead><tr><th>Nome</th><th>Status</th><th>Vínculo</th><th>Ações</th></tr></thead><tbody>
      {rows.length ? rows.map((row) => <tr key={row.id}><td>{row.name || row.nome}</td><td><StatusPill value={row.status} /></td><td>{row.client?.name || row.site?.name || row.asset?.nome || row.location || '-'}</td><td><div className="rowActions"><button onClick={() => setViewing(row)} title="Visualizar"><Eye size={14} /><span>Visualizar</span></button><button onClick={() => openEdit(row)} title="Editar"><Pencil size={14} /><span>Editar</span></button><button onClick={() => setActive(row)} title="Ativar ou inativar"><Power size={14} /><span>Ativar/Inativar</span></button><button onClick={() => remove(row)} title="Excluir"><Trash2 size={14} /><span>Excluir</span></button></div></td></tr>) : <tr><td colSpan="4">Nenhum registro cadastrado.</td></tr>}
    </tbody></table></div>
  </section>;
}

export default function RegistryPage(props) {
  return <RegistryCrud {...props} />;
}
