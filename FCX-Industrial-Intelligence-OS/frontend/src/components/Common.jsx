import { RefreshCw } from 'lucide-react';

export const formatNumber = (value, decimals = 0) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(Number(value || 0));

export function formatCell(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'string' && value.includes('T') && value.includes(':')) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString('pt-BR');
  }
  if (typeof value === 'number') return formatNumber(value, 2);
  return String(value);
}

export function PageHeader({ eyebrow, title, subtitle, resource }) {
  return (
    <header className="pageHeader">
      <div><span className="eyebrow">{eyebrow || 'FCX Industrial Intelligence OS'}</span><h1>{title}</h1><p>{subtitle}</p></div>
      {resource ? (
        <button className="refreshButton" onClick={resource.refresh} disabled={resource.loading}>
          <RefreshCw size={16} className={resource.loading ? 'spin' : ''} /> Atualizar
        </button>
      ) : null}
    </header>
  );
}

export function ResourceState({ resource }) {
  if (resource.loading && !resource.updatedAt) return <div className="notice">Carregando dados operacionais...</div>;
  if (resource.error) return <div className="notice warning">{resource.error}</div>;
  return null;
}

export function Kpi({ label, value, detail, tone = 'normal' }) {
  return <article className={`kpi ${tone}`}><span>{label}</span><strong>{value}</strong>{detail ? <small>{detail}</small> : null}</article>;
}

export function Panel({ title, subtitle, children, className = '' }) {
  return <article className={`panel ${className}`}><header><div><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div></header>{children}</article>;
}

export function EmptyState({ message = 'Nenhum registro encontrado.' }) {
  return <div className="emptyState">{message}</div>;
}

export function StatusPill({ value }) {
  const status = String(value || 'unknown').toLowerCase().replaceAll('_', '-');
  return <span className={`pill ${status}`}>{formatCell(value)}</span>;
}

export function DataTable({ columns, rows }) {
  return (
    <div className="tableWrap">
      <table>
        <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.slice(0, 250).map((row, index) => (
            <tr key={row.id || index}>{columns.map((column) => (
              <td key={column.key}>{column.status ? <StatusPill value={row[column.key]} /> : formatCell(row[column.key])}</td>
            ))}</tr>
          )) : <tr><td colSpan={columns.length}><EmptyState /></td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export function Sparkline({ data, suffix }) {
  const values = data.slice(-36).map((item) => Number(item.value || 0));
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => `${values.length === 1 ? 0 : (index / (values.length - 1)) * 100},${44 - (value / max) * 38}`);
  return <><div className="trendValue">{formatNumber(values.at(-1), 2)} <small>{suffix}</small></div><svg className="sparkline" viewBox="0 0 100 48" preserveAspectRatio="none"><polyline points={points.join(' ')} /></svg></>;
}
