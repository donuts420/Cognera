import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../context/LocaleContext.jsx';
import { GAMES } from '../../games/registry.js';
import Icon from '../Icon.jsx';

export default function RecentRow({ recent }) {
  const { t } = useLocale();
  if (!recent || !recent.length) return null;
  return (
    <div className="recent-row">
      {recent.map((r) => (
        <Link key={r.slug} to={`/play/${r.slug}`} className="recent-card">
          <span className="ico" aria-hidden><Icon name={GAMES[r.slug]?.meta.icon || 'dice'} size={34} /></span>
          <div className="ttl">{r.title}</div>
          <div className="meta">{t('game.levelLabel', { n: r.level ?? 1 })}</div>
        </Link>
      ))}
    </div>
  );
}
