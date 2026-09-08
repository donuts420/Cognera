import React, { useEffect, useRef, useState } from 'react';
import { SEQUENCE_PADS, label } from './assets.js';
import { tone } from './sound.js';

export default function SequenceMemory({ levelConfig, locale, t, speak, onTrial, onFeedback, onComplete }) {
  const startLen = levelConfig.span || 2;
  const [seq, setSeq] = useState([]);
  const [lit, setLit] = useState(-1);
  const [phase, setPhase] = useState('watch'); // watch | repeat
  const [pos, setPos] = useState(0);
  const inputStart = useRef(0);
  const best = useRef(0);
  const startedRef = useRef(false);

  const playSequence = (fullSeq) => {
    onFeedback('');
    setPhase('watch');
    setPos(0);
    let i = 0;
    const step = () => {
      if (i >= fullSeq.length) {
        setLit(-1);
        setPhase('repeat');
        inputStart.current = Date.now();
        speak(t('games.sequence.yourTurn'));
        return;
      }
      const pad = fullSeq[i];
      setLit(pad);
      tone(SEQUENCE_PADS[pad].tone, 420);
      setTimeout(() => {
        setLit(-1);
        setTimeout(() => { i += 1; step(); }, 260);
      }, 520);
    };
    setTimeout(step, 600);
  };

  const nextRound = (prevSeq) => {
    // seed the first round at the adaptive starting length
    const seed = prevSeq.length === 0
      ? Array.from({ length: startLen }, () => Math.floor(Math.random() * SEQUENCE_PADS.length))
      : [...prevSeq, Math.floor(Math.random() * SEQUENCE_PADS.length)];
    setSeq(seed);
    playSequence(seed);
  };

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    nextRound([]);
  }, []); // eslint-disable-line

  const finishRound = (success) => {
    if (success) {
      best.current = Math.max(best.current, seq.length);
      onFeedback(t('games.sequence.good'));
      setTimeout(() => nextRound(seq), 900); // endless — grows until the first slip
    } else {
      onFeedback(best.current >= startLen ? t('games.reachedSpan', { n: best.current }) : t('games.calmOkay'));
      setTimeout(() => onComplete({ maxSpan: best.current, completed: true, rawScore: best.current }), 1200);
    }
  };

  const handlePad = (padIdx) => {
    if (phase !== 'repeat') return;
    const now = Date.now();
    const latency = now - inputStart.current;
    inputStart.current = now;
    setLit(padIdx);
    tone(SEQUENCE_PADS[padIdx].tone, 300);
    setTimeout(() => setLit(-1), 260);

    const correct = seq[pos] === padIdx;
    onTrial({ kind: 'tap', correct, latency_ms: latency, payload: { length: seq.length, position: pos } });
    if (!correct) {
      setPhase('watch');
      finishRound(false);
      return;
    }
    if (pos + 1 === seq.length) {
      setPhase('watch');
      finishRound(true);
    } else {
      setPos(pos + 1);
    }
  };

  return (
    <div>
      <p className="game-round">{t('games.roundN', { n: Math.max(1, seq.length - startLen + 1) })}</p>
      <div className="game-prompt">
        {phase === 'watch' ? t('games.sequence.watch') : t('games.sequence.yourTurn')}
      </div>
      <div className="seq-pad">
        {SEQUENCE_PADS.map((pad, i) => (
          <button
            key={pad.key}
            className={`seq-btn ${lit === i ? 'lit' : ''}`}
            style={{ background: pad.color }}
            onClick={() => handlePad(i)}
            disabled={phase !== 'repeat'}
            aria-label={label(pad.label, locale)}
          />
        ))}
      </div>
    </div>
  );
}
