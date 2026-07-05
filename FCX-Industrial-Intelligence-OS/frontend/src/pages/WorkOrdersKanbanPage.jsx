import { useCallback, useMemo, useState } from 'react';
import { apiRequest, useApiResource, withCompany } from '../api';
import { Kpi, PageHeader, ResourceState, StatusPill } from '../components/Common';

const columns = [
  { key: 'OPEN', title: 'Backlog', tone: 'open' },
  { key: 'PLANNED', title: 'Planejado', tone: 'planned' },
  { key: 'IN_PROGRESS', title: 'Em Execução', tone: 'in-progress' },
  { key: 'WAITING_PARTS', title: 'Aguardando Peça', tone: 'waiting-parts' },
  { key: 'CLOSED', title: 'Concluído', tone: 'closed' },
];

export default function WorkOrdersKanbanPage({ activeCompanyId }) {
  const resource = useApiResource(withCompany('/work-orders', activeCompanyId), []);
  const [draggedId, setDraggedId] = useState('');
  const [savingId, setSavingId] = useState('');
  const [actionError, setActionError] = useState('');

  const rows = useMemo(
    () => resource.data.map((row) => ({ ...row, assetName: row.ativo?.nome || row.asset?.nome || row.assetId || '-' })),
    [resource.data],
  );
  const grouped = useMemo(
    () => Object.fromEntries(columns.map((column) => [column.key, rows.filter((row) => row.status === column.key)])),
    [rows],
  );

  const moveWorkOrder = useCallback(async (id, status) => {
    const current = rows.find((row) => row.id === id);
    if (!current || current.status === status || savingId) return;

    try {
      setSavingId(id);
      setActionError('');
      await apiRequest(`/work-orders/${id}`, { method: 'PATCH', body: { status } });
      await resource.refresh();
    } catch {
      setActionError('Não foi possível mover a ordem de serviço. Verifique a conexão com a API.');
    } finally {
      setSavingId('');
      setDraggedId('');
    }
  }, [resource, rows, savingId]);

  const handleDrop = useCallback((event, status) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain') || draggedId;
    if (id) moveWorkOrder(id, status);
  }, [draggedId, moveWorkOrder]);

  const allowDrop = useCallback((event) => event.preventDefault(), []);

  return (
    <>
      <PageHeader title="Kanban de Ordens de Serviço" subtitle="Fluxo operacional com persistência real das etapas de execução." resource={resource} />
      <ResourceState resource={resource} />
      {actionError ? <div className="notice warning">{actionError}</div> : null}
      <section className="kpiGrid compact">
        <Kpi label="Ordens" value={rows.length} />
        <Kpi label="Em execução" value={grouped.IN_PROGRESS?.length || 0} tone="warning" />
        <Kpi label="Urgentes" value={rows.filter((order) => order.prioridade === 'URGENT').length} tone="danger" />
      </section>
      {resource.loading && !resource.updatedAt ? <div className="notice">Carregando ordens de serviço...</div> : null}
      {!resource.loading && !resource.error && !rows.length ? <div className="emptyState">Nenhuma ordem de serviço encontrada.</div> : null}
      <section className="kanbanBoard" aria-label="Kanban de ordens de serviço">
        {columns.map((column) => (
          <article className={`kanbanColumn ${column.tone}`} key={column.key} onDragOver={allowDrop} onDrop={(event) => handleDrop(event, column.key)}>
            <header><h2>{column.title}</h2><span>{grouped[column.key]?.length || 0}</span></header>
            <div className="kanbanCards">
              {grouped[column.key]?.length ? grouped[column.key].map((order) => (
                <div
                  className={`kanbanCard ${savingId === order.id ? 'saving' : ''}`}
                  draggable={!savingId}
                  key={order.id}
                  onDragStart={(event) => {
                    setDraggedId(order.id);
                    event.dataTransfer.setData('text/plain', order.id);
                  }}
                >
                  <span className="eyebrow">{order.numeroOs || order.id}</span>
                  <strong>{order.assetName}</strong>
                  <p>{order.descricao || 'Sem descrição'}</p>
                  <div className="kanbanMeta">
                    <StatusPill value={order.prioridade} />
                    <StatusPill value={order.status} />
                  </div>
                  <label>
                    <span>Etapa</span>
                    <select disabled={savingId === order.id} value={order.status} onChange={(event) => moveWorkOrder(order.id, event.target.value)}>
                      {columns.map((option) => <option key={option.key} value={option.key}>{option.title}</option>)}
                    </select>
                  </label>
                </div>
              )) : <div className="emptyState">Nenhuma ordem nesta etapa.</div>}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
