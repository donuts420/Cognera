import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';

export default function GamesPage() {
  const { id } = useParams();
  const { t } = useLocale();
  const [games, setGames] = useState([]);

  useEffect(() => {
    api.get(`/patients/${id}/game-state`).then(setGames).catch(() => {});
  }, [id]);

  return (
    <div>
      <Link to={`/patients/${id}`} className="text-sm text-muted" style={{ display: 'inline-block', marginBottom: 'var(--gap-md)' }}>&larr; {t('common.back')}</Link>
      <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--gap-lg)' }}>{t('nav.games')}</h1>
      <div className="grid-2">
        {games.map((g) => (
          <div key={g.slug} className="card">
            <div className="flex justify-between items-center mb-md">
              <h2 style={{ fontSize: 'var(--text-lg)' }}>{g.title}</h2>
              <span className="badge badge-info">{t('game.levelLabel', { n: g.current_level + 1 })}</span>
            </div>
            <p className="text-sm text-muted mb-md">{g.description}</p>
            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
              {g.domains?.map((d) => (
                <span key={d} className="badge badge-info">{t(`game.${d}`)}</span>
              ))}
            </div>
            <div className="flex justify-between items-center mt-md">
              <span className="text-sm text-muted">{t('game.theta')}: {g.theta?.toFixed(1)}</span>
              <span className="text-sm text-muted">{t('game.playedCount', { n: g.sessions_played })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
