import React from 'react';
import { GAMES } from '../../games/registry.js';
import Icon from '../Icon.jsx';
import { formatMetric, METRIC_LABEL } from '../../lib/benchmarks.js';

/** Small clickable box: one game's headline stat. Click → opens StatModal. */
export default function StatBox({ game, onClick }) {
  const meta = GAMES[game.slug]?.meta || {};
  return (
    <button className="stat-box-btn" onClick={onClick}>
      <span className="sb-icon"><Icon name={meta.icon || 'dice'} size={22} /></span>
      <span className="sb-title">{game.title}</span>
      <span className="sb-value">{formatMetric(game.metric, game.latest ?? game.best)}</span>
      <span className="sb-label">{METRIC_LABEL[game.metric] || ''}{game.plays ? ` · ${game.plays}×` : ''}</span>
    </button>
  );
}
