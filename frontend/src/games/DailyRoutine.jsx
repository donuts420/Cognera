import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ROUTINES, shuffle, label } from './assets.js';

export default function DailyRoutine({ levelConfig, locale, t, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const steps = levelConfig.steps || 3;
  const routine = useMemo(() => ROUTINES[Math.floor(Math.random() * ROUTINES.length)], []);
  const canonical = useMemo(() => routine.steps.slice(0, Math.min(steps, routine.steps.length)), [routine, steps]);
  const pool = useMemo(() => shuffle(canonical.map((s, i) => ({ ...s, id: i }))), [canonical]);

  const [placed, setPlaced] = useState([]);
  const start = useRef(Date.now());

  useEffect(() => {
    onProgress({ current: 0, total: canonical.length });
    speak(t('games.routine.prompt', { name: label(routine.label, locale) }));
  }, []); // eslint-disable-line

  const place = (item) => {
    if (placed.find((p) => p.id === item.id)) {
      setPlaced(placed.filter((p) => p.id !== item.id));
      onProgress({ current: placed.length - 1, total: canonical.length });
    } else {
      const np = [...placed, item];
      setPlaced(np);
      onProgress({ current: np.length, total: canonical.length });
    }
  };

  const submit = () => {
    let correct = 0;
    placed.forEach((p, idx) => {
      const isRight = p.id === idx;
      if (isRight) correct += 1;
      onTrial({ kind: 'order', correct: isRight, latency_ms: null, payload: { position: idx, expected: idx, got: p.id } });
    });
    const acc = correct / canonical.length;
    if (acc === 1) {
      onFeedback(t('games.routine.perfect'));
      onComplete({ completed: true, rawScore: correct, payload: { arrange_ms: Date.now() - start.current } });
    } else {
      onFeedback(t('games.routine.closeOne', { n: correct, total: canonical.length }));
      onComplete({ completed: true, rawScore: correct, payload: { arrange_ms: Date.now() - start.current } });
    }
  };

  const orderNumber = (item) => {
    const i = placed.findIndex((p) => p.id === item.id);
    return i === -1 ? '' : i + 1;
  };

  return (
    <div>
      <div className="game-prompt">{t('games.routine.prompt', { name: label(routine.label, locale) })}</div>
      <p className="game-subprompt">{t('games.routine.hint')}</p>
      <div className="order-list">
        {pool.map((item) => (
          <button
            key={item.id}
            className={`order-item ${orderNumber(item) ? 'placed' : ''}`}
            onClick={() => place(item)}
          >
            <span className="slot-num">{orderNumber(item)}</span>
            <span className="glyph">{item.glyph}</span>
            <span>{label(item.label, locale)}</span>
          </button>
        ))}
      </div>
      {placed.length === canonical.length && (
        <button className="btn btn-primary btn-lg" style={{ marginTop: 24 }} onClick={submit}>
          {t('games.done')}
        </button>
      )}
    </div>
  );
}
