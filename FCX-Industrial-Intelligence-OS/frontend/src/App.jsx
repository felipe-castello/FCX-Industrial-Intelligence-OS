import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import { AlarmsPage, TelemetryPage, WorkOrdersPage } from './pages/OperationsPages';
import AssetsPage from './pages/AssetsPage';
import PredictivePage from './pages/PredictivePage';
import IntegrationsPage from './pages/IntegrationsPage';
import { useApiHealth } from './api';
import { useApiResource } from './api';
import CompaniesPage from './pages/CompaniesPage';

const pages = {
  '/dashboard': DashboardPage,
  '/assets': AssetsPage,
  '/telemetry': TelemetryPage,
  '/alarms': AlarmsPage,
  '/work-orders': WorkOrdersPage,
  '/predictive': PredictivePage,
  '/integrations': IntegrationsPage,
  '/companies': CompaniesPage,
};

function normalizeRoute(pathname) {
  return pages[pathname] ? pathname : '/dashboard';
}

export default function App() {
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

  return (
    <Layout route={route} navigate={navigate} health={health} checkHealth={check} companies={companies.data} activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId}>
      <Page companies={companies} activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} />
    </Layout>
  );
}
