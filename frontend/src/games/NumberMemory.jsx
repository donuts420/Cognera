import React, { useEffect, useRef, useState } from 'react';

// Endless digit-span game, one more digit each round, until the first slip.
function makeDigits(n) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10));
}

export default function NumberMemory({ t, speak, onTrial, onFeedback, onComplete }) {
  const startCount = 3;
  const [count, setCount] = useState(startCount);
  const [round, setRound] = useState(1);
  const [digits, setDigits] = useState(() => makeDigits(startCount));
  const [phase, setPhase] = useState('show'); // show | recall | done
  const [entered, setEntered] = useState([]);
  const lastTap = useRef(0);
  const best = useRef(0);

  const beginRound = (n) => {
    onFeedback('');
    setDigits(makeDigits(n));
    setCount(n);
    setEntered([]);
    setPhase('show');
    speak(t('games.number.remember'));
    setTimeout(() => {
      setPhase('recall');
      lastTap.current = Date.now();
      speak(t('games.number.nowTap'));
    }, 1600 + 750 * n);
  };

  useEffect(() => { beginRound(startCount); }, []); // eslint-disable-line

  const finish = () => {
    onFeedback(best.current >= startCount ? t('games.reachedSpan', { n: best.current }) : t('games.calmOkay'));
    setTimeout(() => onComplete({ maxSpan: best.current, completed: true, rawScore: best.current }), 1200);
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
      finish();
      return;
    }
    const next = [...entered, d];
    setEntered(next);
    if (next.length === digits.length) {
      setPhase('done');
      best.current = Math.max(best.current, count);
      onFeedback(t('games.number.correct'));
      const nextRound = round + 1;
      setTimeout(() => { setRound(nextRound); beginRound(count + 1); }, 1000);
    }
  };

  return (
    <div>
      <p className="game-round">{t('games.roundN', { n: round })}</p>
      {phase === 'show' && (
        <>
          <div className="game-prompt">{t('games.number.remember')}</div>
          <div className="game-bignum">{digits.join('  ')}</div>
        </>
      )}
      {(phase === 'recall' || phase === 'done') && (
        <>
          <div className="game-prompt">{t('games.number.nowTap')}</div>
          <div className="game-bignum" style={{ fontSize: 'clamp(40px, 9vw, 64px)', minHeight: 64 }}>
            {entered.join(' ')}
            {Array.from({ length: count - entered.length }).map((_, i) => (
              <span key={i} style={{ opacity: 0.3 }}> •</span>
            ))}
          </div>
          <div className="game-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', maxWidth: 520, marginTop: 20 }}>
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
