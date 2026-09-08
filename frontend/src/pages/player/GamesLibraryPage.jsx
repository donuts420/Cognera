import React, { useEffect, useMemo, useState } from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { PageHead, EmptyState, Skeleton } from '../../components/player/ui.jsx';
import GameTile from '../../components/player/GameTile.jsx';
import { groupByDomain, DOMAIN_ORDER } from '../../games/registry.js';

export default function GamesLibraryPage() {
  const { t } = useLocale();
  const { gameState, favorites, progress } = usePlayer();
  const [filter, setFilter] = useState('all');
  const [xpToast, setXpToast] = useState(null);

  useEffect(() => {
    let g;
    try { g = sessionStorage.getItem('cognera-xp-gain'); sessionStorage.removeItem('cognera-xp-gain'); } catch {}
    if (g && Number(g) > 0) {
      setXpToast(Number(g));
      const id = setTimeout(() => setXpToast(null), 2600);
      return () => clearTimeout(id);
    }
  }, []);

  const groups = useMemo(() => groupByDomain(gameState || []), [gameState]);
  const filtered = useMemo(() => {
    if (!gameState) return [];
    if (filter === 'all') return null; // use groups
    if (filter === 'fav') return gameState.filter((g) => favorites.has(g.slug));
    return gameState.filter((g) => (g.domains || []).includes(filter));
  }, [gameState, filter, favorites]);

  return (
    <div>
      {xpToast && <div className="xp-toast">+{xpToast} {t('player.xp')} · {t('player.niceWork')}</div>}
      <PageHead eyebrow={t('player.nav.games')} title={t('player.games.title')} sub={t('player.games.sub')} />

      {progress?.playedEnoughToday && (
        <div className="pcard pcard-pad" style={{ marginBottom: 20, background: 'var(--brand-subtle)', borderColor: 'transparent' }}>
          <b style={{ color: 'var(--brand-subtle-ink)' }}>{t('player.games.capBanner')}</b>
        </div>
      )}

      {!gameState ? (
        <div className="lib-grid">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={168} />)}
        </div>
      ) : gameState.length === 0 ? (
        <EmptyState glyph="🌱" title={t('games.libraryEmpty')} />
      ) : (
        <>
          <div className="chip-row">
            <button className={`chip-btn ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
              {t('player.games.all')}
            </button>
            {favorites.size > 0 && (
              <button className={`chip-btn ${filter === 'fav' ? 'on' : ''}`} onClick={() => setFilter('fav')}>
                ♥ {t('player.dash.favorites')}
              </button>
            )}
            {DOMAIN_ORDER.filter((d) => groups.some((g) => g.domain === d)).map((d) => (
              <button key={d} className={`chip-btn ${filter === d ? 'on' : ''}`} onClick={() => setFilter(d)}>
                {t(`game.${d}`)}
              </button>
            ))}
          </div>

          {filtered ? (
            <div className="lib-grid">
              {filtered.map((g) => <GameTile key={g.slug} game={g} />)}
            </div>
          ) : (
            groups.map(({ domain, games }) => (
              <div key={domain} className="lib-group">
                <h3>{t(`game.${domain}`)}</h3>
                <div className="lib-grid">
                  {games.map((g) => <GameTile key={g.slug} game={g} />)}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
