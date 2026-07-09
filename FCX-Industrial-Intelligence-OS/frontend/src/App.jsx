import { useEffect, useMemo, useState } from 'react';
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
import WorkOrdersKanbanPage from './pages/WorkOrdersKanbanPage';
import DeviceAgentsTab from './pages/DeviceAgentsTab';
import SecuritySettingsPage from './pages/SecuritySettingsPage';
import { NotFoundPage } from './pages/SystemStatePages';

const pages = {
  '/dashboard': DashboardPage,
  '/assets': AssetsPage,
  '/telemetry': TelemetryPage,
  '/alarms': AlarmsPage,
  '/work-orders': WorkOrdersPage,
  '/ordens-servico/kanban': WorkOrdersKanbanPage,
  '/predictive': PredictivePage,
  '/integrations': IntegrationsPage,
  '/configuracoes/seguranca': SecuritySettingsPage,
  '/404': NotFoundPage,
  '/companies': CompaniesPage,
  '/clients': (props) => <RegistryPage kind="clients" {...props} />,
  '/sites': (props) => <RegistryPage kind="sites" {...props} />,
  '/units': (props) => <RegistryPage kind="sites" {...props} />,
  '/devices': (props) => <RegistryPage kind="devices" {...props} />,
  '/security': SecuritySettingsPage,
};

function normalizeRoute(pathname) {
  if (pathname === '/') return '/dashboard';
  if (/^\/dispositivos\/[^/]+\/agentes$/.test(pathname)) return '/dispositivos/:id/agentes';
  return pages[pathname] ? pathname : '/404';
}

function deviceIdFromPath(pathname) {
  return decodeURIComponent(pathname.match(/^\/dispositivos\/([^/]+)\/agentes$/)?.[1] || '');
}

function companyFromUser(user) {
  const companyId = user?.companyId || user?.tenantId;
  if (!companyId) return null;
  return {
    id: companyId,
    name: user?.company?.name || user?.companyName || user?.empresa || `Empresa ${companyId}`,
  };
}

export default function App() {
  const [authState, setAuthState] = useState(() => ({
    authenticated: !AUTH_ENABLED || hasSession(),
    user: AUTH_ENABLED ? getSessionUser() : null,
  }));
  const [route, setRoute] = useState(normalizeRoute(window.location.pathname));
  const { health, check } = useApiHealth();
  const companies = useApiResource('/companies', [], { enabled: !AUTH_ENABLED || authState.authenticated });
  const [activeCompanyId, setActiveCompanyIdState] = useState(() => localStorage.getItem('fcx.activeCompanyId') || '');
  const Page = route === '/dispositivos/:id/agentes' ? DeviceAgentsTab : pages[route];
  const sessionCompany = useMemo(() => companyFromUser(authState.user), [authState.user]);
  const availableCompanies = useMemo(() => (
    companies.data.length ? companies.data : sessionCompany ? [sessionCompany] : []
  ), [companies.data, sessionCompany]);
  const companiesForView = useMemo(() => ({ ...companies, data: availableCompanies }), [availableCompanies, companies]);

  useEffect(() => {
    if (!availableCompanies.length) return;

    const activeCompanyExists = availableCompanies.some((company) => company.id === activeCompanyId);
    if (!activeCompanyId || !activeCompanyExists) {
      setActiveCompanyId(availableCompanies[0].id);
    }
  }, [activeCompanyId, availableCompanies]);

  useEffect(() => {
    if (authState.authenticated) companies.refresh();
  }, [authState.authenticated, companies.refresh]);

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
    const companyId = session.user?.companyId || session.user?.tenantId;
    if (companyId) setActiveCompanyId(companyId);
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
    <Layout route={route} navigate={navigate} health={health} checkHealth={check} companies={availableCompanies} activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} currentUser={authState.user} onLogout={AUTH_ENABLED ? handleLogout : null}>
      <Page companies={companiesForView} activeCompanyId={activeCompanyId} setActiveCompanyId={setActiveCompanyId} deviceId={deviceIdFromPath(window.location.pathname)} />
    </Layout>
  );
}
