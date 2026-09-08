import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useConnectivity } from '../context/ConnectivityContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePush } from '../hooks/usePush.js';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

export default function AppShell() {
  const { user, logout } = useAuth();
  const { online } = useConnectivity();
  const { locale, setLocale, t } = useLocale();
  const { supported, permission, subscribed, loading: pushLoading, subscribe, unsubscribe } = usePush();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const toggleLocale = () => setLocale(locale === 'en' ? 'as' : 'en');
  const togglePush = async () => {
    if (subscribed && permission === 'granted') await unsubscribe();
    else await subscribe();
  };
  const showPushBtn = supported && !(subscribed && permission === 'granted');

  const nav = [
    { to: '/care', end: true, icon: 'grid', label: t('nav.dashboard') },
    { to: '/care/patients', icon: 'user', label: t('nav.patients') },
  ];
  if (user?.role === 'health_worker' || user?.role === 'admin') {
    nav.push({ to: '/care/caseload', icon: 'map', label: t('nav.caseload') });
  }

  return (
    <div className="player-shell">
      <aside className="player-sidebar">
        <div className="player-brand">
          <span className="mark"><Logo size={24} tone="cream" /></span>
          <span className="name">{t('app.name')}</span>
        </div>
        <p className="eyebrow" style={{ padding: '0 8px 6px', color: 'rgba(255,255,255,0.4)' }}>
          {t('nav.careMode') || 'Care'}
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) => `player-nav-link ${isActive ? 'active' : ''}`}>
              <span className="ico"><Icon name={item.icon} size={22} /></span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="spacer" />
        {!online && (
          <p className="eyebrow" style={{ padding: '0 8px 8px', color: 'var(--caution)' }}>{t('common.offline')}</p>
        )}
        <NavLink to="/" className="player-nav-link" style={{ fontSize: 'var(--text-sm)' }}>
          <span className="ico"><Icon name="home" size={22} /></span>
          {t('player.backToHome')}
        </NavLink>
        <button className="player-account" onClick={handleLogout}
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <span className="avatar">{(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}</span>
          <span className="who">{user?.full_name || user?.email}</span>
          <Icon name="close" size={16} style={{ opacity: 0.5 }} />
        </button>
      </aside>

      <main className="player-main">
        <header className="care-topbar">
          <span className="chip brand">{user?.role}</span>
          <div className="flex items-center gap-sm">
            {showPushBtn && (
              <button onClick={togglePush} disabled={pushLoading} className="chip-btn" style={{ minHeight: 40 }}>
                {subscribed ? t('push.disable') : permission === 'denied' ? t('push.denied') : t('push.enable')}
              </button>
            )}
            <button onClick={toggleLocale} className="chip-btn" style={{ minHeight: 40 }}>
              {locale === 'en' ? 'অসমীয়া' : 'English'}
            </button>
          </div>
        </header>
        <div className="player-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
