import React, { useEffect, useRef, useState } from 'react';
import { shuffle } from './assets.js';

/**
 * Endless span game. Start at the adaptive span, +1 each time the board is
 * cleared in order, and it keeps going until the first mistake — which ends the
 * session warmly with the highest span completed.
 */
function buildBoard(span) {
  // a little breathing room, but kept wide-and-short so the board never
  // needs to scroll (≈3 rows even at high spans).
  const cellCount = span + Math.ceil(span * 0.4) + 2;
  const cols = Math.min(7, Math.max(4, Math.round(Math.sqrt(cellCount * 1.9))));
  const rows = Math.max(2, Math.ceil(cellCount / cols));
  const total = cols * rows;
  const positions = shuffle(Array.from({ length: total }, (_, i) => i)).slice(0, span);
  const cells = Array(total).fill(null);
  positions.forEach((pos, i) => { cells[pos] = i + 1; });
  return { cells, cols };
}

export default function ChimpTest({ levelConfig, t, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const startSpan = levelConfig.span || 2;
  const [span, setSpan] = useState(startSpan);
  const [round, setRound] = useState(1);
  const [board, setBoard] = useState(() => buildBoard(startSpan));
  const [studying, setStudying] = useState(true);
  const [next, setNext] = useState(1);
  const [done, setDone] = useState([]);
  const [ended, setEnded] = useState(false);

  const studyStart = useRef(Date.now());
  const lastTap = useRef(0);
  const bestSpan = useRef(0);

  useEffect(() => { speak(t('games.chimp.study')); }, []); // eslint-disable-line

  const startRound = (nextSpan) => {
    onFeedback('');
    setSpan(nextSpan);
    setBoard(buildBoard(nextSpan));
    setStudying(true);
    setNext(1);
    setDone([]);
    setEnded(false);
    studyStart.current = Date.now();
    speak(t('games.chimp.study'));
  };

  const finish = () => {
    onFeedback(bestSpan.current >= startSpan ? t('games.reachedSpan', { n: bestSpan.current }) : t('games.calmOkay'));
    setTimeout(() => onComplete({ maxSpan: bestSpan.current, completed: true, rawScore: bestSpan.current }), 1200);
  };

  const handleCell = (pos) => {
    const value = board.cells[pos];
    if (studying) {
      if (value !== 1) return;
      onTrial({ kind: 'view', correct: true, latency_ms: Date.now() - studyStart.current, payload: { span } });
      setStudying(false);
      lastTap.current = Date.now();
    }
    if (done.includes(pos) || ended) return;
    const expected = next;
    const now = Date.now();
    const latency = lastTap.current ? now - lastTap.current : null;
    lastTap.current = now;
    const correct = value === expected;
    onTrial({ kind: 'select', correct, latency_ms: latency, payload: { span, expected, got: value } });

    if (!correct) {
      setEnded(true);
      finish();
      return;
    }
    const newDone = [...done, pos];
    setDone(newDone);
    if (expected >= span) {
      // board cleared — grow and continue
      setEnded(true);
      bestSpan.current = Math.max(bestSpan.current, span);
      onFeedback(t('games.chimp.nice'));
      const nextRound = round + 1;
      setTimeout(() => { setRound(nextRound); startRound(span + 1); }, 1000);
    } else {
      setNext(expected + 1);
    }
  };

  return (
    <div>
      <p className="game-round">{t('games.roundN', { n: round })}</p>
      <div className="game-prompt">
        {studying ? t('games.chimp.study') : t('games.chimp.recall')}
      </div>
      <div
        className="game-grid chimp-grid"
        style={{ gridTemplateColumns: `repeat(${board.cols}, 1fr)`, maxWidth: Math.min(560, board.cols * 90) }}
      >
        {board.cells.map((value, pos) => {
          if (value == null) return <span key={pos} className="chimp-empty" aria-hidden />;
          const isDone = done.includes(pos);
          return (
            <button
              key={pos}
              className={`tile ${isDone ? 'correct' : studying ? 'revealed' : 'hidden-tile'}`}
              onClick={() => handleCell(pos)}
              aria-label={studying ? String(value) : t('games.chimp.hiddenTile')}
            >
              {studying ? value : ''}
            </button>
          );
        })}
      </div>
      {studying && (
        <p className="game-subprompt" style={{ marginTop: 20 }}>{t('games.chimp.tapOneToStart')}</p>
      )}
    </div>
  );
}
