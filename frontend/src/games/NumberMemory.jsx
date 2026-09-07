import React, { useEffect, useRef, useState } from 'react';

const MAX_ROUNDS = 5;

function makeDigits(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10));
}

export default function NumberMemory({ levelConfig, t, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const [count, setCount] = useState(levelConfig.digits || 2);
  const [round, setRound] = useState(0);
  const [digits, setDigits] = useState(() => makeDigits(levelConfig.digits || 2));
  const [phase, setPhase] = useState('show'); // show | recall
  const [entered, setEntered] = useState([]);
  const lastTap = useRef(0);
  const best = useRef(0);

  const beginRound = (n) => {
    const d = makeDigits(n);
    setDigits(d);
    setCount(n);
    setEntered([]);
    setPhase('show');
    speak(t('games.number.remember'));
    const showMs = 1600 + 750 * n;
    setTimeout(() => {
      setPhase('recall');
      lastTap.current = Date.now();
      speak(t('games.number.nowTap'));
    }, showMs);
  };

  useEffect(() => {
    onProgress({ current: 0, total: MAX_ROUNDS });
    beginRound(levelConfig.digits || 2);
  }, []); // eslint-disable-line

  const endRound = (success) => {
    if (success) {
      best.current = Math.max(best.current, count);
      onFeedback(t('games.number.correct'));
    } else {
      onFeedback(t('games.calmTryNext'));
    }
    const nextRound = round + 1;
    onProgress({ current: nextRound, total: MAX_ROUNDS });
    setTimeout(() => {
      if (nextRound >= MAX_ROUNDS) {
        onComplete({ maxSpan: best.current, completed: true, rawScore: best.current });
      } else {
        setRound(nextRound);
        beginRound(success ? count + 1 : Math.max(2, count - 1));
      }
    }, 1200);
  };

  const tapDigit = (d) => {
    if (phase !== 'recall') return;
    const now = Date.now();
    const latency = now - lastTap.current;
    lastTap.current = now;
    const idx = entered.length;
    const correct = digits[idx] === d;
    onTrial({ kind: 'digit', correct, latency_ms: latency, payload: { span: count, position: idx } });
    if (!correct) {
      setPhase('done');
      endRound(false);
      return;
    }
    const next = [...entered, d];
    setEntered(next);
    if (next.length === digits.length) {
      setPhase('done');
      endRound(true);
    }
  };

  return (
    <div>
      {phase === 'show' && (
        <>
          <div className="game-prompt">{t('games.number.remember')}</div>
          <div className="game-bignum">{digits.join('  ')}</div>
        </>
      )}
      {(phase === 'recall' || phase === 'done') && (
        <>
          <div className="game-prompt">{t('games.number.nowTap')}</div>
          <div className="game-bignum" style={{ fontSize: 56, minHeight: 72 }}>
            {entered.map((d, i) => (i < entered.length ? d : '•')).join(' ')}
            {Array.from({ length: count - entered.length }).map((_, i) => (
              <span key={i} style={{ opacity: 0.3 }}> •</span>
            ))}
          </div>
          <div className="game-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', maxWidth: 560, marginTop: 24 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => (
              <button key={d} className="tile" onClick={() => tapDigit(d)} disabled={phase !== 'recall'}>
                {d}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
