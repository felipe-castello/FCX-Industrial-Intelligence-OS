import { Building2 } from 'lucide-react';
import { DataTable, Kpi, PageHeader, ResourceState } from '../components/Common';

export default function CompaniesPage({ companies, activeCompanyId, setActiveCompanyId }) {
  const rows = companies.data.map((company) => ({
    ...company,
    sitesCount: company._count?.sites || 0,
    assetsCount: company._count?.assets || 0,
    usersCount: company._count?.users || 0,
  }));

  return <>
    <PageHeader title="Empresas" subtitle="Clientes e ambientes industriais isolados na plataforma SaaS." resource={companies} />
    <ResourceState resource={companies} />
    <section className="kpiGrid compact">
      <Kpi label="Empresas ativas" value={rows.filter((item) => item.status === 'ACTIVE').length} />
      <Kpi label="Sites" value={rows.reduce((sum, item) => sum + item.sitesCount, 0)} />
      <Kpi label="Ativos" value={rows.reduce((sum, item) => sum + item.assetsCount, 0)} />
    </section>
    <div className="companyGrid">
      {rows.map((company) => <button key={company.id} className={`companyCard ${activeCompanyId === company.id ? 'active' : ''}`} onClick={() => setActiveCompanyId(company.id)}>
        <Building2 size={20} /><strong>{company.name}</strong><span>{company.assetsCount} ativos em {company.sitesCount} sites</span>
      </button>)}
    </div>
    <DataTable columns={[{ key: 'name', label: 'Empresa' }, { key: 'document', label: 'Documento' }, { key: 'contactName', label: 'Contato' }, { key: 'contactEmail', label: 'E-mail' }, { key: 'sitesCount', label: 'Sites' }, { key: 'assetsCount', label: 'Ativos' }, { key: 'status', label: 'Status', status: true }]} rows={rows} emptyMessage="Nenhuma empresa cadastrada." />
  </>;
}
