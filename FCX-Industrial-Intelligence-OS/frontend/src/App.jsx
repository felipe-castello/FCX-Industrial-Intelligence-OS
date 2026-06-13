import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import { AlarmsPage, TelemetryPage, WorkOrdersPage } from './pages/OperationsPages';
import AssetsPage from './pages/AssetsPage';
import PredictivePage from './pages/PredictivePage';
import IntegrationsPage from './pages/IntegrationsPage';
import { AUTH_ENABLED, getSessionUser, hasSession, logout, useApiHealth, useApiResource } from './api';
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
  const [authState, setAuthState] = useState(() => ({
    authenticated: !AUTH_ENABLED || hasSession(),
    user: AUTH_ENABLED ? getSessionUser() : null,
  }));
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

  function handleAuthenticated(session) {
    setAuthState({ authenticated: true, user: session.user });
    window.history.replaceState({}, '', '/dashboard');
    setRoute('/dashboard');
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setAuthState({ authenticated: false, user: null });
      window.history.replaceState({}, '', '/login');
      setRoute('/login');
    }
  }

  useEffect(() => {
    const clearUserContext = () => setAuthState({ authenticated: false, user: null });
    window.addEventListener('fcx:session-cleared', clearUserContext);
    return () => window.removeEventListener('fcx:session-cleared', clearUserContext);
  }, []);

  useEffect(() => {
    if (AUTH_ENABLED && !authState.authenticated && window.location.pathname !== '/login') {
      window.history.replaceState({}, '', '/login');
      setRoute('/login');
    }
  }, [authState.authenticated]);

  if (!authState.authenticated) return <AuthPage onAuthenticated={handleAuthenticated} />;

  return (
    <Layout route={route} navigate={navigate} health={health} checkHealth={check} companies={companies.data} activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} currentUser={authState.user} onLogout={AUTH_ENABLED ? handleLogout : null}>
      <Page companies={companies} activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} />
    </Layout>
  );
}
