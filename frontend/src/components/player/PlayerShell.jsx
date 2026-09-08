import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLocale } from '../../context/LocaleContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { NAV_ITEMS } from './nav-items.js';

export default function PlayerShell() {
  const { t } = useLocale();
  const { patient } = usePlayer();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const initial = (patient?.display_name || 'M').trim().charAt(0).toUpperCase();

  return (
    <div className="player-shell">
      <aside className="player-sidebar">
        <div className="player-brand">
          <span className="mark">C</span>
          <span className="name">{t('app.name')}</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `player-nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="ico" aria-hidden>{item.icon}</span>
              {t(item.label)}
            </NavLink>
          ))}
        </nav>
        <div className="spacer" />
        <NavLink to="/care" className="player-nav-link" style={{ fontSize: 'var(--text-sm)' }}>
          <span className="ico" aria-hidden>🩺</span>
          {t('player.nav.careMode')}
        </NavLink>
        <NavLink to="/profile" className="player-account">
          <span className="avatar">{initial}</span>
          <span className="who">{patient?.display_name || t('player.you')}</span>
          <span aria-hidden style={{ opacity: 0.5 }}>›</span>
        </NavLink>
      </aside>

      <main className="player-main">
        <div className="player-content">
          <Outlet />
        </div>
      </main>

      <nav className="player-tabbar">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <span className="ico" aria-hidden>{item.icon}</span>
            {t(item.label)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
