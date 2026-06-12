import { Eye, Pencil, Plus, Power, Save, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiRequest, useApiResource, withCompany } from '../api';
import { PageHeader, ResourceState, StatusPill } from '../components/Common';

const configs = {
  companies: {
    title: 'Cadastro de empresas',
    path: '/companies',
    fields: ['name', 'document', 'contactName', 'contactEmail', 'contactPhone'],
    initial: { name: '', document: '', contactName: '', contactEmail: '', contactPhone: '', status: 'ACTIVE' },
    createLabel: 'Nova Empresa',
    active: 'ACTIVE', inactive: 'INACTIVE',
  },
  clients: {
    title: 'Clientes',
    path: '/clients',
    fields: ['name', 'cnpj', 'email', 'phone', 'address', 'city', 'state'],
    initial: { name: '', cnpj: '', email: '', phone: '', address: '', city: '', state: '', status: 'ACTIVE' },
    createLabel: 'Novo Cliente',
    active: 'ACTIVE', inactive: 'INACTIVE',
  },
  sites: {
    title: 'Unidades',
    path: '/sites',
    fields: ['clientId', 'name', 'address', 'city', 'state'],
    initial: { clientId: '', name: '', address: '', city: '', state: '', status: 'ACTIVE' },
    createLabel: 'Nova Unidade',
    active: 'ACTIVE', inactive: 'INACTIVE',
  },
  assets: {
    title: 'Gestão cadastral de ativos',
    path: '/assets',
    fields: ['siteId', 'name', 'type', 'brand', 'model', 'location', 'criticality'],
    initial: { siteId: '', name: '', type: 'OTHER', brand: '', model: '', location: '', criticality: 'MEDIUM', status: 'ONLINE' },
    createLabel: 'Novo Ativo',
    active: 'ONLINE', inactive: 'OFFLINE',
  },
  devices: {
    title: 'Dispositivos',
    path: '/devices',
    fields: ['assetId', 'name', 'serialNumber', 'deviceType', 'protocol'],
    initial: { assetId: '', name: '', serialNumber: '', deviceType: '', protocol: 'MQTT', status: 'ONLINE' },
    createLabel: 'Novo Dispositivo',
    active: 'ONLINE', inactive: 'INACTIVE',
  },
};

const labels = { clientId: 'Cliente', siteId: 'Unidade', assetId: 'Ativo', name: 'Nome', document: 'Documento', contactName: 'Contato', contactEmail: 'E-mail do contato', contactPhone: 'Telefone do contato', cnpj: 'CNPJ', email: 'E-mail', phone: 'Telefone', address: 'Endereço', city: 'Cidade', state: 'Estado', type: 'Tipo', brand: 'Marca', model: 'Modelo', location: 'Localização', criticality: 'Criticidade', serialNumber: 'Número de série', deviceType: 'Tipo de dispositivo', protocol: 'Protocolo' };

export function RegistryCrud({ kind, activeCompanyId, embedded = false }) {
  const config = configs[kind];
  const resource = useApiResource(withCompany(config.path, activeCompanyId), []);
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

  function openCreate() { setEditing('new'); setViewing(null); setForm(config.initial); }
  function openEdit(row) {
    setEditing(row.id);
    setViewing(null);
    setForm(Object.fromEntries([...config.fields, 'status'].map((field) => [field, row[field] ?? config.initial[field] ?? ''])));
  }
  function update(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  async function save(event) {
    event.preventDefault();
    const path = editing === 'new' ? config.path : `${config.path}/${editing}`;
    const relationshipFields = new Set(['clientId', 'siteId', 'assetId']);
    const payload = Object.fromEntries(
      [...config.fields, 'status']
        .map((field) => [field, relationshipFields.has(field) && form[field] === '' ? null : form[field]])
        .filter(([, value]) => value !== ''),
    );
    await apiRequest(path, { method: editing === 'new' ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    setEditing(null); setMessage('Registro salvo com sucesso.'); resource.refresh();
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
    <div className="assetToolbar"><span>{resource.data.length} registros</span><button className="primaryButton" onClick={openCreate}><Plus size={15} />{config.createLabel}</button></div>
    {editing ? <form className="assetForm registryForm" onSubmit={save}>
      {config.fields.map((field) => <label key={field}>{labels[field] || field}{lookups[field] ? <select value={form[field] || ''} onChange={(event) => update(field, event.target.value)}><option value="">Sem vínculo</option>{lookups[field].map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select> : <input required={['name', 'cnpj', 'serialNumber'].includes(field)} value={form[field] || ''} onChange={(event) => update(field, event.target.value)} />}</label>)}
      <button className="primaryButton formSubmit"><Save size={15} />Salvar</button><button type="button" className="refreshButton formSubmit" onClick={() => setEditing(null)}><X size={15} />Cancelar</button>
    </form> : null}
    {viewing ? <div className="recordDetail"><strong>{viewing.name || viewing.nome}</strong><pre>{JSON.stringify(viewing, null, 2)}</pre></div> : null}
    <div className="tableWrap"><table><thead><tr><th>Nome</th><th>Status</th><th>Vínculo</th><th>Ações</th></tr></thead><tbody>
      {resource.data.length ? resource.data.map((row) => <tr key={row.id}><td>{row.name || row.nome}</td><td><StatusPill value={row.status} /></td><td>{row.client?.name || row.site?.name || row.asset?.nome || row.location || '-'}</td><td><div className="rowActions"><button onClick={() => setViewing(row)} title="Visualizar"><Eye size={14} /><span>Visualizar</span></button><button onClick={() => openEdit(row)} title="Editar"><Pencil size={14} /><span>Editar</span></button><button onClick={() => setActive(row)} title="Ativar ou inativar"><Power size={14} /><span>Ativar/Inativar</span></button><button onClick={() => remove(row)} title="Excluir"><Trash2 size={14} /><span>Excluir</span></button></div></td></tr>) : <tr><td colSpan="4">Nenhum registro cadastrado.</td></tr>}
    </tbody></table></div>
  </section>;
}

export default function RegistryPage(props) {
  return <RegistryCrud {...props} />;
}
