import React, { useState } from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import Icon from '../Icon.jsx';
import StatModal from './StatModal.jsx';
import { getBenchmark } from '../../lib/benchmarks.js';

function fmtTime(ms) {
  const s = Math.round((ms || 0) / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

/** Post-game results: warm line + a row of clickable stat boxes. */
export default function GameResults({ result, game, onAgain, onDone }) {
  const { t } = useLocale();
  const { history, patient } = usePlayer();
  const [modal, setModal] = useState(false);

  const s = result?.session || {};
  const age = patient?.birth_year ? new Date().getFullYear() - patient.birth_year : null;

  const SPAN = ['chimp-test', 'number-memory', 'sequence-memory'].includes(game.slug);
  const RT = game.slug === 'reaction-time';

  let boxes;
  if (SPAN) {
    boxes = [
      { k: 'span', v: s.max_span ?? '–', label: t('results.reached') },
      { k: 'time', v: fmtTime(s.duration_ms), label: t('results.time') },
      { k: 'rounds', v: s.trials_total ? Math.max(1, Math.round(s.trials_total / Math.max(1, s.max_span || 1))) : '–', label: t('results.rounds') },
    ];
  } else if (RT) {
    boxes = [
      { k: 'median', v: s.median_latency_ms != null ? `${Math.round(s.median_latency_ms)} ms` : '–', label: t('results.median') },
      { k: 'trials', v: s.trials_total ?? '–', label: t('results.trials') },
      { k: 'time', v: fmtTime(s.duration_ms), label: t('results.time') },
    ];
  } else {
    boxes = [
      { k: 'acc', v: s.accuracy != null ? `${Math.round(s.accuracy * 100)}%` : '–', label: t('results.accuracy') },
      { k: 'correct', v: `${s.trials_correct ?? 0}/${s.trials_total ?? 0}`, label: t('results.correct') },
      { k: 'time', v: fmtTime(s.duration_ms), label: t('results.time') },
    ];
  }

  const histGame = (history?.games || []).find((g) => g.slug === game.slug);
  const hasDetails = !!histGame && (histGame.series?.length > 1 || getBenchmark(game.slug, { age }));

  return (
    <div className="game-panel results-panel" role="dialog" aria-modal="true">
      <div style={{ color: 'var(--success)' }}><Icon name="sprout" size={48} /></div>
      <h2>{t('games.wellDone')}</h2>
      <p>{result?.summary || t('results.sub')}</p>

      <div className="result-box-row">
        {boxes.map((b) => (
          <button
            key={b.k}
            className="result-box"
            onClick={() => hasDetails && setModal(true)}
            disabled={!hasDetails}
          >
            <span className="rb-value">{b.v}</span>
            <span className="rb-label">{b.label}</span>
          </button>
        ))}
      </div>

      {hasDetails && (
        <button className="text-link" onClick={() => setModal(true)}>{t('results.seeDetails')} →</button>
      )}

      <div className="flex gap-sm" style={{ flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
        <button className="btn btn-primary btn-lg" onClick={onAgain}>{t('games.playAnother')}</button>
        <button className="btn btn-ghost btn-lg" onClick={onDone}>{t('games.done')}</button>
      </div>

      {modal && histGame && (
        <StatModal game={histGame} age={age} onClose={() => setModal(false)} />
      )}
    </div>
  );
}
