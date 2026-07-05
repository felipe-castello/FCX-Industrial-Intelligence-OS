import { useEffect, useMemo, useState } from 'react';
import { apiRequest, ENABLE_DEVICE_AGENTS } from '../api';
import { PageHeader } from '../components/Common';

function relativeTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function statusLabel(status) {
  return ['online', 'active', 'running', 'healthy'].includes(String(status || '').toLowerCase()) ? 'Online' : 'Offline';
}

export default function DeviceAgentsTab({ deviceId }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(ENABLE_DEVICE_AGENTS);

  useEffect(() => {
    if (!ENABLE_DEVICE_AGENTS || !deviceId) {
      setAgents([]);
      setLoading(false);
      return;
    }
    let active = true;
    apiRequest(`/api/devices/${encodeURIComponent(deviceId)}/agents`, { allowNotFound: true, fallback: [] })
      .then((payload) => { if (active) setAgents(Array.isArray(payload) ? payload : []); })
      .catch(() => { if (active) setAgents([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [deviceId]);

  const rows = useMemo(() => agents.map((agent) => ({
    id: agent.id || agent.name || agent.nome,
    name: agent.name || agent.nome || '-',
    version: agent.version || agent.versao || '-',
    status: statusLabel(agent.status),
    lastSync: agent.lastSync || agent.lastSynchronization || agent.ultimaSincronizacao,
  })), [agents]);

  if (!ENABLE_DEVICE_AGENTS) {
    return <div className="emptyState">Sub-tab Agentes desativada por feature flag.</div>;
  }

  return <>
    <PageHeader title="Agentes do Dispositivo" subtitle="Runtime e sincronização dos agentes vinculados." />
    {loading ? <div className="agentSkeleton"><span /><span /><span /></div> : null}
    {!loading && !rows.length ? <div className="emptyState">Nenhum agente vinculado a este dispositivo ainda.</div> : null}
    {!loading && rows.length ? (
      <div className="tableWrap" tabIndex={0} aria-label="Tabela de agentes do dispositivo">
        <table aria-label="Agentes vinculados ao dispositivo">
          <thead><tr><th>Nome</th><th>Versão</th><th>Status</th><th>Última Sincronização</th></tr></thead>
          <tbody>{rows.map((agent) => (
            <tr key={agent.id}>
              <td>{agent.name}</td>
              <td>{agent.version}</td>
              <td><span className={`agentStatus ${agent.status.toLowerCase()}`}><span className="agentStatusDot" />{agent.status}</span></td>
              <td title={agent.lastSync || ''}>{relativeTime(agent.lastSync)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    ) : null}
  </>;
}
