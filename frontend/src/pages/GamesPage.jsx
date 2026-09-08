import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { GAMES, groupByDomain } from '../games/registry.js';
import Icon from '../components/Icon.jsx';

export default function GamesPage() {
  const { id } = useParams();
  const { t } = useLocale();
  const [games, setGames] = useState([]);

  useEffect(() => {
    api.get(`/patients/${id}/game-state`).then(setGames).catch(() => {});
  }, [id]);

  const groups = groupByDomain(games);

  return (
    <div>
      <Link to={`/care/patients/${id}`} className="text-sm text-muted" style={{ display: 'inline-block', marginBottom: 'var(--gap-md)' }}>
        &larr; {t('common.back')}
      </Link>
      <div className="flex justify-between items-center mb-lg">
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>{t('nav.games')}</h1>
      </div>

      {groups.map(({ domain, games: rows }) => (
        <div key={domain} className="game-lib-group">
          <h3>{t(`game.${domain}`)}</h3>
          <div className="game-lib-grid">
            {rows.map((g) => {
              const meta = GAMES[g.slug]?.meta || {};
              return (
                <div key={g.slug} className="game-card" style={{ cursor: 'default' }}>
                  <span className="game-card-icon"><Icon name={meta.icon || 'dice'} size={40} /></span>
                  <h4>{g.title}</h4>
                  <p>{g.description}</p>
                  <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 8 }}>
                    <span className="badge badge-info">{t('game.levelLabel', { n: g.current_level ?? 1 })}</span>
                    <span className="text-sm text-muted">{t('game.playedCount', { n: g.sessions_played ?? 0 })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
