import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../../context/LocaleContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { GAMES, normalizeDomains } from '../../games/registry.js';

export default function GameTile({ game }) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = usePlayer();
  const meta = GAMES[game.slug]?.meta || {};
  const fav = favorites.has(game.slug);
  const domains = normalizeDomains(game.domains);
  const unscored = meta.scored === false;

  return (
    <div
      className="game-tile"
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/play/${game.slug}`)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate(`/play/${game.slug}`)}
    >
      <button
        className={`fav-btn ${fav ? 'on' : ''}`}
        aria-label={fav ? t('player.unfavorite') : t('player.favorite')}
        aria-pressed={fav}
        onClick={(e) => { e.stopPropagation(); toggleFavorite(game.slug); }}
      >
        {fav ? '♥' : '♡'}
      </button>
      <span className="ico" aria-hidden>{meta.icon || '🎲'}</span>
      <h4>{game.title}</h4>
      <p>{game.description}</p>
      <div className="tile-meta">
        {domains[0] && <span className="chip brand">{t(`game.${domains[0]}`)}</span>}
        {unscored ? (
          <span className="chip">{t('games.reminisce')}</span>
        ) : (
          <span className="chip accent">{t('game.levelLabel', { n: game.current_level ?? 1 })}</span>
        )}
      </div>
    </div>
  );
}
