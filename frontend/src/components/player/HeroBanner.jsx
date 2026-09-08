import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../context/LocaleContext.jsx';
import { GAMES } from '../../games/registry.js';
import Icon from '../Icon.jsx';

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
        <Link to="/calendar" className="hero-cta">{t('player.hero.seeProgress')} <Icon name="arrow-right" size={20} /></Link>
      </div>
    );
  }

  const slug = progress.recommended;
  const row = (gameState || []).find((g) => g.slug === slug);
  const meta = GAMES[slug]?.meta;
  const title = row?.title || t('player.hero.anActivity');
  const icon = meta?.icon || 'dice';
  const domains = (row?.domains || []);
  const skill = Array.isArray(domains) && domains[0]
    ? t(`game.${domains[0]}`)
    : t('game.memory');

  return (
    <Link to={slug ? `/play/${slug}` : '/games'} className="hero">
      <p className="kicker">{t('player.hero.todayKicker')}</p>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name={icon} size={34} /> {title}
      </h2>
      <p>{t('player.hero.todayBody', { skill })}</p>
      <span className="hero-cta">{t('player.hero.play')} <Icon name="arrow-right" size={20} /></span>
    </Link>
  );
}
