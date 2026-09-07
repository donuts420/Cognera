import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useConnectivity } from '../context/ConnectivityContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function AppShell() {
  const { user, logout } = useAuth();
  const { online, lastSynced } = useConnectivity();
  const { locale, setLocale, t } = useLocale();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'as' : 'en');
  };

  return (
    <div className="layout-care">
      <nav className="sidebar">
        <div className="flex items-center gap-sm p-md" style={{ borderBottom: '1px solid var(--border)', marginBottom: 'var(--gap-sm)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '18px' }}>
            C
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{t('app.name')}</div>
          </div>
        </div>
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>{t('nav.dashboard')}</NavLink>
        <NavLink to="/patients" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>{t('nav.patients')}</NavLink>
        {(user?.role === 'health_worker' || user?.role === 'admin') && (
          <NavLink to="/caseload" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>{t('nav.caseload')}</NavLink>
        )}
        <div style={{ flex: 1 }} />
        <div className="text-sm text-muted p-md">
          {!online && <span style={{ color: 'var(--warning)' }}>{t('common.offline')}</span>}
          {online && lastSynced && <span>{t('common.lastSynced', { time: lastSynced })}</span>}
        </div>
        <button className="sidebar-link" onClick={handleLogout}>{t('nav.logout')}</button>
      </nav>
      <div className="layout-care-main">
        <header className="topbar">
          <div style={{ fontWeight: 600 }}>{user?.full_name || user?.email}</div>
          <div className="flex items-center gap-sm">
            <button onClick={toggleLocale} className="btn btn-ghost" style={{ minHeight: 40, fontSize: 'var(--text-sm)', padding: '4px 12px' }}>
              {locale === 'en' ? 'অসমীয়া' : 'English'}
            </button>
            <div className="text-sm text-muted">{user?.role}</div>
          </div>
        </header>
        <main className="layout-care-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
