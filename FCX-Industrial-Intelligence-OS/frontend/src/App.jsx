import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import { AlarmsPage, TelemetryPage, WorkOrdersPage } from './pages/OperationsPages';
import AssetsPage from './pages/AssetsPage';
import PredictivePage from './pages/PredictivePage';
import IntegrationsPage from './pages/IntegrationsPage';
import { useApiHealth } from './api';

const pages = {
  '/dashboard': DashboardPage,
  '/assets': AssetsPage,
  '/telemetry': TelemetryPage,
  '/alarms': AlarmsPage,
  '/work-orders': WorkOrdersPage,
  '/predictive': PredictivePage,
  '/integrations': IntegrationsPage,
};

function normalizeRoute(pathname) {
  return pages[pathname] ? pathname : '/dashboard';
}

export default function App() {
  const [route, setRoute] = useState(normalizeRoute(window.location.pathname));
  const { health, check } = useApiHealth();
  const Page = pages[route];

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
    <Layout route={route} navigate={navigate} health={health} checkHealth={check}>
      <Page />
    </Layout>
  );
}
