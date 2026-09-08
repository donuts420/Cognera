import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { GAMES, groupByDomain } from '../games/registry.js';
import Icon from '../components/Icon.jsx';
import { PageHead } from '../components/player/ui.jsx';

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
      <Link to={`/care/patients/${id}`} className="care-back">
        <Icon name="arrow-left" size={16} /> {t('common.back')}
      </Link>
      <PageHead eyebrow={t('nav.careMode') || 'Care'} title={t('nav.games')} sub={t('player.games.sub')} />

      {groups.map(({ domain, games: rows }) => (
        <div key={domain} className="lib-group">
          <h3>{t(`game.${domain}`)}</h3>
          <div className="lib-grid">
            {rows.map((g) => {
              const meta = GAMES[g.slug]?.meta || {};
              return (
                <div key={g.slug} className="game-tile" style={{ cursor: 'default' }}>
                  <span className="ico"><Icon name={meta.icon || 'dice'} size={40} /></span>
                  <h4>{g.title}</h4>
                  <p>{g.description}</p>
                  <div className="tile-meta">
                    <span className="chip accent">{t('game.levelLabel', { n: g.current_level ?? 1 })}</span>
                    <span className="chip">{t('game.playedCount', { n: g.sessions_played ?? 0 })}</span>
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
