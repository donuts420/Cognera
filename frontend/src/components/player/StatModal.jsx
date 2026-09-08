import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '../../context/LocaleContext.jsx';
import { GAMES } from '../../games/registry.js';
import Icon from '../Icon.jsx';
import MiniChart from './MiniChart.jsx';
import { getBenchmark, formatMetric, METRIC_LABEL } from '../../lib/benchmarks.js';

function BenchBar({ label, value, max, unit, tone }) {
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  return (
    <div className="bench-bar">
      <span className="bench-label">{label}</span>
      <span className="bench-track">
        <span className={`bench-fill ${tone}`} style={{ width: `${pct}%` }} />
      </span>
      <span className="bench-val">{unit === 'ms' ? `${Math.round(value)} ms` : Math.round(value * 10) / 10}</span>
    </div>
  );
}

export default function StatModal({ game, age, onClose }) {
  const { t, locale } = useLocale();

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  if (!game) return null;
  const meta = GAMES[game.slug]?.meta || {};
  const values = game.series.map((p) => p.value);
  const bench = getBenchmark(game.slug, { age });
  const dfmt = (iso) =>
    new Date(iso).toLocaleDateString(locale === 'as' ? 'as-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN',
      { day: 'numeric', month: 'short' });

  const sessionLine = (p) => {
    if (game.metric === 'span') return t('history.line.span', { n: p.span ?? '—' });
    if (game.metric === 'latency') return t('history.line.latency', { n: Math.round(p.latency ?? 0) });
    return t('history.line.accuracy', { n: Math.round((p.accuracy ?? 0) * 100) });
  };

  return createPortal(
    <div className="stat-overlay" onClick={onClose}>
      <div className="stat-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="stat-close" onClick={onClose} aria-label={t('common.close')}>
          <Icon name="close" size={22} />
        </button>

        <div className="stat-modal-head">
          <span className="stat-modal-icon"><Icon name={meta.icon || 'dice'} size={28} /></span>
          <div>
            <p className="eyebrow">{METRIC_LABEL[game.metric] || ''}</p>
            <h2 className="font-display">{game.title}</h2>
          </div>
        </div>

        <div className="stat-headline">
          <div>
            <span className="big">{formatMetric(game.metric, game.latest)}</span>
            <span className="cap">{t('history.latest')}</span>
          </div>
          <div>
            <span className="big">{formatMetric(game.metric, game.best)}</span>
            <span className="cap">{t('history.best')}</span>
          </div>
          <div>
            <span className="big">{game.plays}</span>
            <span className="cap">{t('history.plays')}</span>
          </div>
        </div>

        <MiniChart
          series={values}
          unit={game.metric === 'latency' ? 'ms' : ''}
          lowerBetter={game.lowerBetter}
          refs={bench ? [
            { value: bench.typical, label: t('history.typical') },
            ...(bench.forAge ? [{ value: bench.forAge, label: t('history.forAge') }] : []),
          ] : []}
        />

        {bench && (
          <div className="bench-block">
            <p className="eyebrow">{t('history.howItCompares')}</p>
            <BenchBar label={t('history.you')} value={game.lowerBetter ? game.best : game.best} max={bench.scaleMax}
              unit={bench.unit} tone="you" />
            <BenchBar label={t('history.typical')} value={bench.typical} max={bench.scaleMax} unit={bench.unit} tone="typical" />
            {bench.forAge != null && (
              <BenchBar label={t('history.forAge')} value={bench.forAge} max={bench.scaleMax} unit={bench.unit} tone="age" />
            )}
            <p className="bench-note">{bench.note}</p>
            {!age && bench.forAge == null && (
              <p className="bench-note">{t('history.addAge')}</p>
            )}
          </div>
        )}

        <div className="stat-sessions">
          <p className="eyebrow">{t('history.recentAttempts')}</p>
          {[...game.series].reverse().slice(0, 8).map((p, i) => (
            <div className="stat-session-row" key={i}>
              <span>{dfmt(p.t)}</span>
              <span className="v">{sessionLine(p)}</span>
            </div>
          ))}
        </div>

        <p className="stat-disclaimer">{t('history.disclaimer')}</p>
      </div>
    </div>,
    document.body
  );
}
