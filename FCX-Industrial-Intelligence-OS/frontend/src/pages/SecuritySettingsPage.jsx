import { PageHeader } from '../components/Common';

export default function SecuritySettingsPage() {
  return (
    <>
      <PageHeader title="Segurança (RBAC)" subtitle="Perfis, permissões e controle de acesso em preparação." />
      <section className="panel">
        <header>
          <div>
            <h2>Módulo RBAC em preparação</h2>
            <p>Configurações visuais de segurança serão liberadas por feature flag.</p>
          </div>
        </header>
        <div className="emptyState">Nenhuma regra RBAC disponível para exibição.</div>
      </section>
    </>
  );
}
