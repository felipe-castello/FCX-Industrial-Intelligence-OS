import {
  Activity,
  Building2,
  Boxes,
  ClipboardList,
  Cpu,
  Gauge,
  LayoutDashboard,
  MapPin,
  Menu,
  RadioTower,
  RefreshCw,
  ServerCog,
  Settings,
  ShieldCheck,
  TriangleAlert,
  Users,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL, ENABLE_OS_KANBAN, ENABLE_RBAC_MENU, useApiResource, withCompany } from '../api';
import UserMenu from './UserMenu';

const navigation = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: '1' },
  { path: '/companies', label: 'Empresas', icon: Building2, shortcut: '2' },
  { path: '/clients', label: 'Clientes', icon: Users, shortcut: '3' },
  { path: '/sites', label: 'Unidades', icon: MapPin, shortcut: '4' },
  { path: '/assets', label: 'Ativos', icon: Boxes, shortcut: '5' },
  { path: '/devices', label: 'Dispositivos', icon: Cpu, shortcut: '6' },
  { path: '/telemetry', label: 'Telemetria', icon: RadioTower, shortcut: '7' },
  { path: '/alarms', label: 'Alarmes', icon: TriangleAlert, shortcut: '8' },
  { path: ENABLE_OS_KANBAN ? '/ordens-servico/kanban' : '/work-orders', label: 'Ordens de Serviço', icon: ClipboardList, shortcut: '9' },
  { path: '/integrations', label: 'Integrações', icon: ServerCog, shortcut: 'i' },
];

export default function Layout({ route, navigate, health, checkHealth, companies, activeCompanyId, setActiveCompanyId, currentUser, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const contentRef = useRef(null);
  const assets = useApiResource(withCompany('/assets', activeCompanyId), []);
  const online = health.status === 'ok';
  const connectedDevices = Array.isArray(assets.data) ? assets.data.length : 0;
  const hasCompanies = companies.length > 0;

  const go = useCallback((path) => {
    navigate(path);
    setMenuOpen(false);
  }, [navigate]);

  useEffect(() => {
    contentRef.current?.focus({ preventScroll: true });
  }, [route]);

  useEffect(() => {
    function onKeyDown(event) {
      const target = event.target;
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'SELECT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (typing) return;
      if (event.key === 'Escape') setMenuOpen(false);
      if (event.altKey && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        checkHealth();
      }
      if (event.altKey) {
        const item = navigation.find((navItem) => navItem.shortcut === event.key.toLowerCase());
        if (item) {
          event.preventDefault();
          go(item.path);
        }
        if (ENABLE_RBAC_MENU && event.key.toLowerCase() === 's') {
          event.preventDefault();
          go('/configuracoes/seguranca');
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [checkHealth, go]);

  return (
    <div className="appShell">
      <a className="skipLink" href="#content">Ir para o conteudo</a>
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`} id="primary-navigation">
        <div className="brand">
          <div className="brandMark"><Gauge size={24} /></div>
          <div><strong>FCX 5.2</strong><span>Industrial Intelligence OS</span></div>
          <button className="iconButton mobileOnly" onClick={() => setMenuOpen(false)} title="Fechar menu" aria-label="Fechar menu" aria-controls="primary-navigation" aria-expanded={menuOpen}><X size={18} /></button>
        </div>
        <nav className="primaryNav" aria-label="Navegação principal">
          {navigation.map(({ path, label, icon: Icon, shortcut }) => (
            <button aria-current={route === path ? 'page' : undefined} aria-label={`${label}. Atalho Alt+${shortcut.toUpperCase()}`} className={route === path ? 'active' : ''} key={path} onClick={() => go(path)}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
          {ENABLE_RBAC_MENU ? (
            <div className="navGroup">
              <div className="navGroupLabel"><Settings size={16} /><span>Configurações</span></div>
              <button aria-current={route === '/configuracoes/seguranca' ? 'page' : undefined} aria-label="Segurança RBAC. Atalho Alt+S" className={route === '/configuracoes/seguranca' ? 'active navSubItem' : 'navSubItem'} onClick={() => go('/configuracoes/seguranca')}>
                <ShieldCheck size={18} /><span>Segurança (RBAC)</span>
              </button>
            </div>
          ) : null}
        </nav>
        <div className="sidebarFooter">
          <div className="systemTag"><Activity size={15} /><span>Operação industrial</span></div>
          <small>API: {API_URL}</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button className="iconButton mobileOnly" onClick={() => setMenuOpen(true)} title="Abrir menu" aria-label="Abrir menu" aria-controls="primary-navigation" aria-expanded={menuOpen}><Menu size={20} /></button>
          <label className="companySelector"><span>Empresa ativa</span><select value={hasCompanies ? activeCompanyId : ''} disabled={!hasCompanies} onChange={(event) => setActiveCompanyId(event.target.value)}>{hasCompanies ? companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>) : <option value="">Carregando empresas</option>}</select></label>
          <div className="statusBadges">
            <button aria-label="Verificar status da API. Atalho Alt+R" className={`connectionStatus ${online ? 'online' : health.status}`} onClick={checkHealth}>
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
        <main className="content" id="content" ref={contentRef} tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
