import {
  Activity,
  BrainCircuit,
  Building2,
  Boxes,
  ClipboardList,
  Cpu,
  Gauge,
  LayoutDashboard,
  Menu,
  MapPin,
  RadioTower,
  RefreshCw,
  ServerCog,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { API_URL, useApiResource, withCompany } from '../api';
import UserMenu from './UserMenu';

const navigation = [
  { path: '/dashboard', label: 'Visão executiva', icon: LayoutDashboard },
  { path: '/companies', label: 'Empresas', icon: Building2 },
  { path: '/clients', label: 'Clientes', icon: Building2 },
  { path: '/sites', label: 'Unidades', icon: MapPin },
  { path: '/assets', label: 'Ativos', icon: Boxes },
  { path: '/devices', label: 'Dispositivos', icon: Cpu },
  { path: '/telemetry', label: 'Telemetria', icon: RadioTower },
  { path: '/alarms', label: 'Alarmes', icon: TriangleAlert },
  { path: '/work-orders', label: 'Manutenção / OS', icon: ClipboardList },
  { path: '/predictive', label: 'IA preditiva', icon: BrainCircuit },
  { path: '/integrations', label: 'Integrações', icon: ServerCog },
];

export default function Layout({ route, navigate, health, checkHealth, companies, activeCompanyId, setActiveCompanyId, currentUser, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const assets = useApiResource(withCompany('/assets', activeCompanyId), []);
  const online = health.status === 'ok';
  const connectedDevices = Array.isArray(assets.data) ? assets.data.length : 0;

  function go(path) {
    navigate(path);
    setMenuOpen(false);
  }

  return (
    <div className="appShell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brandMark"><Gauge size={24} /></div>
          <div><strong>FCX 5.0</strong><span>Industrial Intelligence OS</span></div>
          <button className="iconButton mobileOnly" onClick={() => setMenuOpen(false)} title="Fechar menu"><X size={18} /></button>
        </div>
        <nav className="primaryNav">
          {navigation.map(({ path, label, icon: Icon }) => (
            <button className={route === path ? 'active' : ''} key={path} onClick={() => go(path)}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebarFooter">
          <div className="systemTag"><Activity size={15} /><span>Operação industrial</span></div>
          <small>API: {API_URL}</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button className="iconButton mobileOnly" onClick={() => setMenuOpen(true)} title="Abrir menu"><Menu size={20} /></button>
          <label className="companySelector"><span>Empresa ativa</span><select value={activeCompanyId} onChange={(event) => setActiveCompanyId(event.target.value)}>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label>
          <div className="statusBadges">
            <button className={`connectionStatus ${online ? 'online' : health.status}`} onClick={checkHealth}>
              <span className="statusDot" />
              <span>{online ? 'API ONLINE' : health.status === 'checking' ? 'Verificando API' : 'API indisponível'}</span>
              <RefreshCw size={14} />
            </button>
            <span className="deviceBadge">{connectedDevices} Dispositivos Conectados</span>
            {onLogout ? <UserMenu user={currentUser} onLogout={onLogout} /> : null}
          </div>
        </header>
        {!online && health.status !== 'checking' ? (
          <div className="apiBanner">
            A API está indisponível no momento. A interface continua acessível, mas os dados podem estar desatualizados.
          </div>
        ) : null}
        {online && connectedDevices === 0 ? <div className="platformBanner">Nenhum dispositivo conectado para esta empresa.</div> : null}
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
