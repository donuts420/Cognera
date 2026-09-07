import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NER_OBJECTS, pick, shuffle, label } from './assets.js';

function parseGrid(g) {
  const [a, b] = String(g || '2x2').split('x').map((n) => parseInt(n, 10) || 2);
  let cols = a, rows = b;
  if ((cols * rows) % 2 !== 0) rows -= 1; // keep an even number of cards
  return { cols, rows, pairs: (cols * rows) / 2 };
}

export default function MemoryMatch({ levelConfig, locale, t, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const { cols, rows, pairs } = useMemo(() => parseGrid(levelConfig.grid), [levelConfig.grid]);

  const deck = useMemo(() => {
    const chosen = pick(NER_OBJECTS, pairs);
    return shuffle(
      chosen.flatMap((obj, i) => [
        { id: `${i}a`, pairId: i, obj },
        { id: `${i}b`, pairId: i, obj },
      ])
    );
  }, [pairs]);

  const [flipped, setFlipped] = useState([]); // indexes currently face-up (unmatched)
  const [matched, setMatched] = useState([]); // pairIds solved
  const [busy, setBusy] = useState(false);
  const lastPick = useRef(0);
  const stats = useRef({ matches: 0, mismatches: 0 });

  useEffect(() => {
    onProgress({ current: 0, total: pairs });
    speak(t('games.match.intro'));
  }, []); // eslint-disable-line

  const handleCard = (idx) => {
    if (busy) return;
    const card = deck[idx];
    if (matched.includes(card.pairId) || flipped.includes(idx)) return;

    const now = Date.now();
    const latency = lastPick.current ? now - lastPick.current : null;
    lastPick.current = now;

    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setBusy(true);
      const [i1, i2] = nextFlipped;
      const isMatch = deck[i1].pairId === deck[i2].pairId;
      onTrial({
        kind: 'pair',
        correct: isMatch,
        latency_ms: latency,
        payload: { grid: `${cols}x${rows}`, object: deck[i1].obj.key },
      });
      if (isMatch) {
        stats.current.matches += 1;
        const nm = [...matched, deck[i1].pairId];
        setTimeout(() => {
          setMatched(nm);
          setFlipped([]);
          setBusy(false);
          onProgress({ current: nm.length, total: pairs });
          if (nm.length === pairs) {
            const attempts = stats.current.matches + stats.current.mismatches;
            onFeedback(t('games.match.allFound'));
            setTimeout(
              () =>
                onComplete({
                  completed: true,
                  rawScore: stats.current.matches,
                  payload: { attempts, mismatches: stats.current.mismatches },
                }),
              1000
            );
          } else {
            onFeedback(t('games.match.goodPair'));
          }
        }, 500);
      } else {
        stats.current.mismatches += 1;
        onFeedback(t('games.match.tryAgain'));
        setTimeout(() => {
          setFlipped([]);
          setBusy(false);
        }, 1100);
      }
    }
  };

  return (
    <div>
      <div className="game-prompt">{t('games.match.prompt')}</div>
      <div
        className="game-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, maxWidth: Math.min(720, cols * 150) }}
      >
        {deck.map((card, idx) => {
          const show = flipped.includes(idx) || matched.includes(card.pairId);
          return (
            <button
              key={card.id}
              className={`tile ${matched.includes(card.pairId) ? 'correct' : show ? 'revealed' : 'hidden-tile'}`}
              onClick={() => handleCard(idx)}
              aria-label={show ? label(card.obj.label, locale) : t('games.match.faceDown')}
            >
              {show ? card.obj.glyph : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
