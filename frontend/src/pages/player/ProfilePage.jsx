import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../context/LocaleContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { api } from '../../lib/api.js';
import { PageHead, Card } from '../../components/player/ui.jsx';

const TEXT_SIZES = ['normal', 'large', 'xlarge'];

function readPref(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

export default function ProfilePage() {
  const { t, locale, setLocale } = useLocale();
  const { user, logout } = useAuth();
  const { patient } = usePlayer();
  const navigate = useNavigate();

  const [name, setName] = useState(patient?.display_name || user?.full_name || '');
  const [textSize, setTextSize] = useState(() => readPref('cognera-text-size', 'normal'));
  const [reducedMotion, setReducedMotion] = useState(() => readPref('cognera-reduced-motion', 'off') === 'on');
  const [saved, setSaved] = useState(false);

  const applyTextSize = (size) => {
    setTextSize(size);
    try { localStorage.setItem('cognera-text-size', size); } catch {}
    const root = document.documentElement;
    if (size === 'normal') root.removeAttribute('data-text-size');
    else root.setAttribute('data-text-size', size);
  };

  const toggleMotion = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    try { localStorage.setItem('cognera-reduced-motion', next ? 'on' : 'off'); } catch {}
    document.documentElement.style.setProperty('--motion', next ? 'reduce' : 'auto');
  };

  const saveName = async () => {
    await api.patch('/auth/me', { full_name: name.trim() }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initial = (name || 'M').trim().charAt(0).toUpperCase();

  return (
    <div>
      <PageHead eyebrow={t('player.nav.profile')} title={t('player.profile.title')} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
        <Card className="pcard">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{
              width: 64, height: 64, flex: 'none', borderRadius: '50%', background: 'var(--accent)',
              color: 'var(--accent-fg)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)',
              fontWeight: 600, fontSize: 28,
            }}>{initial}</span>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 6 }}>
                {t('player.profile.name')}
              </label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={saveName}>
            {saved ? `✓ ${t('common.save')}` : t('common.save')}
          </button>
        </Card>

        <Card className="pcard">
          <h3 className="font-display" style={{ fontSize: 'var(--text-lg)', marginBottom: 12 }}>
            {t('player.profile.language')}
          </h3>
          <div style={{ display: 'flex', gap: 10 }}>
            {['en', 'as'].map((lc) => (
              <button
                key={lc}
                className={`chip-btn ${locale === lc ? 'on' : ''}`}
                onClick={() => setLocale(lc)}
              >
                {t(`lang.${lc}`)}
              </button>
            ))}
          </div>
        </Card>

        <Card className="pcard">
          <h3 className="font-display" style={{ fontSize: 'var(--text-lg)', marginBottom: 4 }}>
            {t('player.profile.textSize')}
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)', marginBottom: 12 }}>
            {t('player.profile.textSizeHint')}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            {TEXT_SIZES.map((s) => (
              <button key={s} className={`chip-btn ${textSize === s ? 'on' : ''}`} onClick={() => applyTextSize(s)}>
                {t(`player.profile.size.${s}`)}
              </button>
            ))}
          </div>
        </Card>

        <Card className="pcard">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <b style={{ display: 'block', color: 'var(--ink)' }}>{t('player.profile.reducedMotion')}</b>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>
                {t('player.profile.reducedMotionHint')}
              </span>
            </div>
            <button className={`taken-toggle ${reducedMotion ? 'on' : ''}`} onClick={toggleMotion} style={{ minWidth: 96 }}>
              {reducedMotion ? t('player.on') : t('player.off')}
            </button>
          </div>
        </Card>

        <button className="btn btn-ghost btn-block" onClick={async () => { await logout(); navigate('/login'); }}>
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
}
