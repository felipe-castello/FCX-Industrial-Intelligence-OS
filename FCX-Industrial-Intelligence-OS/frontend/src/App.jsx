import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import { AlarmsPage, TelemetryPage, WorkOrdersPage } from './pages/OperationsPages';
import AssetsPage from './pages/AssetsPage';
import PredictivePage from './pages/PredictivePage';
import IntegrationsPage from './pages/IntegrationsPage';
import { AUTH_ENABLED, hasSession, logout, useApiHealth, useApiResource } from './api';
import CompaniesPage from './pages/CompaniesPage';
import RegistryPage from './pages/RegistryPage';
import AuthPage from './pages/AuthPage';

const pages = {
  '/dashboard': DashboardPage,
  '/assets': AssetsPage,
  '/telemetry': TelemetryPage,
  '/alarms': AlarmsPage,
  '/work-orders': WorkOrdersPage,
  '/predictive': PredictivePage,
  '/integrations': IntegrationsPage,
  '/companies': CompaniesPage,
  '/clients': (props) => <RegistryPage kind="clients" {...props} />,
  '/sites': (props) => <RegistryPage kind="sites" {...props} />,
  '/devices': (props) => <RegistryPage kind="devices" {...props} />,
};

function normalizeRoute(pathname) {
  return pages[pathname] ? pathname : '/dashboard';
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => !AUTH_ENABLED || hasSession());
  const [route, setRoute] = useState(normalizeRoute(window.location.pathname));
  const { health, check } = useApiHealth();
  const companies = useApiResource('/companies', []);
  const [activeCompanyId, setActiveCompanyIdState] = useState(() => localStorage.getItem('fcx.activeCompanyId') || '');
  const Page = pages[route];

  useEffect(() => {
    if (!activeCompanyId && companies.data[0]?.id) setActiveCompanyIdState(companies.data[0].id);
  }, [activeCompanyId, companies.data]);

  function setActiveCompanyId(companyId) {
    localStorage.setItem('fcx.activeCompanyId', companyId);
    setActiveCompanyIdState(companyId);
  }

  useEffect(() => {
    const onPopState = () => setRoute(normalizeRoute(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function navigate(path) {
    window.history.pushState({}, '', path);
    setRoute(path);
  }

  if (!authenticated) return <AuthPage onAuthenticated={() => window.location.reload()} />;

  return (
    <Layout route={route} navigate={navigate} health={health} checkHealth={check} companies={companies.data} activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} onLogout={AUTH_ENABLED ? async () => { await logout(); setAuthenticated(false); } : null}>
      <Page companies={companies} activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} />
    </Layout>
  );
}
