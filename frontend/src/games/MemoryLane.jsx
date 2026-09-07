import React, { useEffect, useMemo, useState } from 'react';
import { NER_OBJECTS, STORIES, shuffle, label } from './assets.js';

// Unscored reminiscence experience. No correct / incorrect, no telemetry that
// feeds a score (harness treats meta.scored === false as non-scored).
export default function MemoryLane({ locale, t, speak, onComplete }) {
  const cards = useMemo(() => {
    const objs = shuffle(NER_OBJECTS).slice(0, 8).map((o) => ({
      glyph: o.glyph,
      title: label(o.label, locale),
      prompt: t('games.lane.doYouRemember'),
    }));
    const scenes = STORIES.flatMap((s) =>
      s.panels.slice(0, 2).map((p) => ({ glyph: p.glyph, title: label(p.label, locale), prompt: t('games.lane.tellMe') }))
    );
    return shuffle([...objs, ...scenes]);
  }, [locale]);

  const [idx, setIdx] = useState(0);
  const card = cards[idx];

  useEffect(() => {
    if (card) speak(`${card.prompt} ${card.title}`);
  }, [idx]); // eslint-disable-line

  return (
    <div className="flex flex-col items-center gap-md">
      <div style={{ fontSize: 'clamp(90px, 26vw, 220px)', lineHeight: 1 }}>{card.glyph}</div>
      <div className="game-prompt">{card.title}</div>
      <p className="game-subprompt">{card.prompt}</p>
      <div className="flex gap-sm" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          className="btn btn-ghost btn-lg"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
        >
          ← {t('games.lane.previous')}
        </button>
        <button className="btn btn-ghost btn-lg" onClick={() => speak(card.title)}>
          🔊 {t('games.lane.sayAgain')}
        </button>
        {idx + 1 < cards.length ? (
          <button className="btn btn-primary btn-lg" onClick={() => setIdx((i) => i + 1)}>
            {t('games.lane.next')} →
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={() => onComplete({ completed: true })}>
            {t('games.done')}
          </button>
        )}
      </div>
      <p className="text-sm text-muted" style={{ marginTop: 12 }}>
        {t('games.lane.counter', { a: idx + 1, b: cards.length })}
      </p>
    </div>
  );
}
