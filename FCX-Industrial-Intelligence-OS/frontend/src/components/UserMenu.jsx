import { ChevronDown, LogOut, ShieldCheck, UserCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const name = user?.nome || user?.name || user?.email || 'Usuário FCX';
  const role = user?.role || 'Usuário autenticado';

  useEffect(() => {
    function closeMenu(event) {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
    }

    window.addEventListener('pointerdown', closeMenu);
    return () => window.removeEventListener('pointerdown', closeMenu);
  }, []);

  return (
    <div className="userMenu" ref={menuRef}>
      <button className="userMenuTrigger" type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open}>
        <UserCircle size={20} />
        <span><strong>{name}</strong><small>{role}</small></span>
        <ChevronDown size={15} />
      </button>
      {open ? (
        <div className="userMenuPanel">
          <div className="userMenuIdentity">
            <ShieldCheck size={17} />
            <span><strong>{name}</strong><small>{user?.email || role}</small></span>
          </div>
          <button type="button" onClick={onLogout}><LogOut size={16} /><span>Sair</span></button>
        </div>
      ) : null}
    </div>
  );
}
