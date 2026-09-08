import React from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';

export default function XpBar({ level, xpInLevel, xpForNext }) {
  const { t } = useLocale();
  const pct = xpForNext ? Math.min(100, Math.round((xpInLevel / xpForNext) * 100)) : 0;
  return (
    <div className="xp-bar">
      <span className="lvl">{level}</span>
      <div className="xp-body">
        <div className="xp-label">
          <span><b>{t('player.levelN', { n: level })}</b></span>
          <span>{t('player.xpToNext', { n: Math.max(0, xpForNext - xpInLevel) })}</span>
        </div>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
