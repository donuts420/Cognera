import React from 'react';
import { useLocale } from '../context/LocaleContext.jsx';
import { GAMES, groupByDomain } from './registry.js';

export default function GameLibrary({ games, onPick }) {
  const { t } = useLocale();
  const groups = groupByDomain(games);

  if (!games.length) {
    return (
      <div className="empty-state">
        <div style={{ fontSize: 56 }}>🌱</div>
        <p>{t('games.libraryEmpty')}</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 1000 }}>
      {groups.map(({ domain, games: rows }) => (
        <div key={domain} className="game-lib-group">
          <h3>{t(`game.${domain}`)}</h3>
          <div className="game-lib-grid">
            {rows.map((g) => {
              const meta = GAMES[g.slug]?.meta || {};
              return (
                <button key={g.slug} className="game-card" onClick={() => onPick(g)}>
                  <span className="game-card-icon">{meta.icon || '🎲'}</span>
                  <h4>{g.title}</h4>
                  <p>{g.description}</p>
                  <div className="flex gap-sm items-center" style={{ flexWrap: 'wrap' }}>
                    {meta.scored === false ? (
                      <span className="badge badge-info">{t('games.reminisce')}</span>
                    ) : (
                      <span className="badge badge-success">
                        {t('game.levelLabel', { n: (g.current_level ?? 1) })}
                      </span>
                    )}
                    {g.sessions_played > 0 && (
                      <span className="text-sm text-muted">{t('game.playedCount', { n: g.sessions_played })}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
