import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../context/LocaleContext.jsx';
import { GAMES } from '../../games/registry.js';

/**
 * Dashboard hero. Shows today's recommended activity, or a calm "you've done
 * plenty today" state once the 12-minute session cap is reached.
 */
export default function HeroBanner({ progress, gameState }) {
  const { t } = useLocale();
  if (!progress) return null;

  if (progress.playedEnoughToday) {
    return (
      <div className="hero" style={{ cursor: 'default' }}>
        <p className="kicker">{t('player.hero.doneKicker')}</p>
        <h2>{t('player.hero.doneTitle')}</h2>
        <p>{t('player.hero.doneBody', { n: progress.minutesToday })}</p>
        <Link to="/calendar" className="hero-cta">{t('player.hero.seeProgress')} →</Link>
      </div>
    );
  }

  const slug = progress.recommended;
  const row = (gameState || []).find((g) => g.slug === slug);
  const meta = GAMES[slug]?.meta;
  const title = row?.title || t('player.hero.anActivity');
  const icon = meta?.icon || '🎲';
  const domains = (row?.domains || []);
  const skill = Array.isArray(domains) && domains[0]
    ? t(`game.${domains[0]}`)
    : t('game.memory');

  return (
    <Link to={slug ? `/play/${slug}` : '/games'} className="hero">
      <p className="kicker">{t('player.hero.todayKicker')}</p>
      <h2>{icon} {title}</h2>
      <p>{t('player.hero.todayBody', { skill })}</p>
      <span className="hero-cta">{t('player.hero.play')} →</span>
    </Link>
  );
}
