import Icon from '../components/Icon.jsx';
import React, { useEffect, useRef, useState } from 'react';
import { CATEGORIES, shuffle, pick, label } from './assets.js';

const ROUNDS = 6;
const CAT_KEYS = Object.keys(CATEGORIES);

// pairs that are "close" (harder) vs "far" (easy)
const FAR = [['fruit', 'instrument'], ['animal', 'vehicle'], ['plant', 'household'], ['clothing', 'fruit']];
const NEAR = [['fruit', 'plant'], ['animal', 'household'], ['instrument', 'household'], ['vehicle', 'household']];

export default function OddOneOut({ level, t, locale, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const [round, setRound] = useState(0);
  const [items, setItems] = useState([]);
  const [oddIdx, setOddIdx] = useState(0);
  const [solved, setSolved] = useState(false);
  const start = useRef(Date.now());
  const attempts = useRef(0);

  const build = (r) => {
    const count = Math.min(5, 3 + (level >= 1 ? 1 : 0) + (level >= 3 ? 1 : 0));
    const pool = level >= 2 ? NEAR : FAR;
    const [majKey, oddKey] = pool[r % pool.length];
    const maj = CATEGORIES[majKey];
    const odd = CATEGORIES[oddKey];
    const majItems = pick(maj.items, count - 1).concat(maj.items).slice(0, count - 1);
    const oddItem = pick(odd.items, 1)[0];
    const arr = shuffle([
      ...majItems.map((g) => ({ icon: g, odd: false })),
      { icon: oddItem, odd: true },
    ]);
    setItems(arr);
    setOddIdx(arr.findIndex((x) => x.odd));
    setSolved(false);
    start.current = Date.now();
    attempts.current = 0;
    speak(t('games.odd.prompt'));
  };

  useEffect(() => {
    onProgress({ current: 0, total: ROUNDS });
    build(0);
  }, []); // eslint-disable-line

  const advance = () => {
    const next = round + 1;
    onProgress({ current: next, total: ROUNDS });
    setTimeout(() => {
      if (next >= ROUNDS) onComplete({ completed: true, rawScore: ROUNDS });
      else { setRound(next); build(next); }
    }, 1100);
  };

  const handleTap = (idx) => {
    if (solved) return;
    attempts.current += 1;
    const correct = idx === oddIdx;
    if (correct) {
      onTrial({
        kind: 'categorize',
        correct: attempts.current === 1,
        latency_ms: Date.now() - start.current,
        payload: { attempts: attempts.current, difficulty: level >= 2 ? 'near' : 'far' },
      });
      setSolved(true);
      onFeedback(t('games.odd.yes'));
      advance();
    } else {
      onFeedback(t('games.odd.notQuite'));
      if (attempts.current >= 2) {
        onTrial({
          kind: 'categorize',
          correct: false,
          latency_ms: Date.now() - start.current,
          payload: { attempts: attempts.current, difficulty: level >= 2 ? 'near' : 'far' },
        });
        setSolved(true);
        setTimeout(() => onFeedback(t('games.odd.showAnswer')), 400);
        advance();
      }
    }
  };

  return (
    <div>
      <div className="game-prompt">{t('games.odd.prompt')}</div>
      <div className="choice-row">
        {items.map((it, idx) => (
          <button
            key={idx}
            className={`choice ${solved && it.odd ? 'correct' : ''}`}
            onClick={() => handleTap(idx)}
            aria-label={`item ${idx + 1}`}
          >
            <span className="glyph"><Icon name={it.icon} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}
