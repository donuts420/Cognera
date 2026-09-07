import React, { useEffect, useMemo, useRef, useState } from 'react';
import { STORIES, shuffle, label } from './assets.js';

export default function StorySequencing({ levelConfig, locale, t, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const want = levelConfig.panels || 3;
  const story = useMemo(() => STORIES[Math.floor(Math.random() * STORIES.length)], []);
  const canonical = useMemo(() => story.panels.slice(0, Math.min(want, story.panels.length)), [story, want]);
  const pool = useMemo(() => shuffle(canonical.map((p, i) => ({ ...p, id: i }))), [canonical]);

  const [placed, setPlaced] = useState([]);
  const start = useRef(Date.now());

  useEffect(() => {
    onProgress({ current: 0, total: canonical.length });
    speak(t('games.story.prompt', { name: label(story.label, locale) }));
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
      const ok = p.id === idx;
      if (ok) correct += 1;
      onTrial({ kind: 'panel', correct: ok, latency_ms: null, payload: { position: idx, got: p.id } });
    });
    onFeedback(correct === canonical.length ? t('games.story.perfect') : t('games.story.closeOne', { n: correct, total: canonical.length }));
    onComplete({ completed: true, rawScore: correct, payload: { arrange_ms: Date.now() - start.current } });
  };

  const orderNumber = (item) => {
    const i = placed.findIndex((p) => p.id === item.id);
    return i === -1 ? '' : i + 1;
  };

  return (
    <div>
      <div className="game-prompt">{t('games.story.prompt', { name: label(story.label, locale) })}</div>
      <p className="game-subprompt">{t('games.story.hint')}</p>
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
