import React, { useEffect, useRef, useState } from 'react';
import { shuffle } from './assets.js';

const MAX_ROUNDS = 5;
const GRID_COLS = 4;

function buildBoard(span) {
  const rows = Math.max(2, Math.ceil((span + 2) / GRID_COLS) + 1);
  const total = rows * GRID_COLS;
  const positions = shuffle(Array.from({ length: total }, (_, i) => i)).slice(0, span);
  const cells = Array(total).fill(null);
  positions.forEach((pos, i) => { cells[pos] = i + 1; });
  return { cells, cols: GRID_COLS, rows };
}

export default function ChimpTest({ levelConfig, t, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const [span, setSpan] = useState(levelConfig.span || 2);
  const [round, setRound] = useState(0);
  const [board, setBoard] = useState(() => buildBoard(levelConfig.span || 2));
  const [studying, setStudying] = useState(true);
  const [next, setNext] = useState(1);
  const [done, setDone] = useState([]); // positions correctly tapped
  const [ended, setEnded] = useState(false);

  const studyStart = useRef(Date.now());
  const lastTap = useRef(0);
  const bestSpan = useRef(0);

  useEffect(() => { onProgress({ current: round, total: MAX_ROUNDS }); }, [round]); // eslint-disable-line

  const startRound = (nextSpan) => {
    setSpan(nextSpan);
    setBoard(buildBoard(nextSpan));
    setStudying(true);
    setNext(1);
    setDone([]);
    setEnded(false);
    studyStart.current = Date.now();
    speak(t('games.chimp.study'));
  };

  const endRound = (success) => {
    if (ended) return;
    setEnded(true);
    if (success) {
      bestSpan.current = Math.max(bestSpan.current, span);
      onFeedback(t('games.chimp.nice'));
    } else {
      onFeedback(t('games.calmTryNext'));
    }
    const nextRoundNum = round + 1;
    setTimeout(() => {
      if (nextRoundNum >= MAX_ROUNDS) {
        onComplete({ maxSpan: bestSpan.current, completed: true, rawScore: bestSpan.current });
      } else {
        setRound(nextRoundNum);
        startRound(success ? span + 1 : Math.max(2, span - 1));
      }
    }, 1200);
  };

  const handleCell = (pos) => {
    const value = board.cells[pos];
    if (studying) {
      if (value !== 1) return; // must start with 1
      const viewMs = Date.now() - studyStart.current;
      onTrial({ kind: 'view', correct: true, latency_ms: viewMs, payload: { span } });
      setStudying(false);
      lastTap.current = Date.now();
      // fall through to treat this tap as selecting "1"
    }
    if (done.includes(pos) || ended) return;
    const expectedValue = next;
    const now = Date.now();
    const latency = lastTap.current ? now - lastTap.current : null;
    lastTap.current = now;
    const correct = value === expectedValue;
    onTrial({ kind: 'select', correct, latency_ms: latency, payload: { span, expected: expectedValue, got: value } });
    if (!correct) {
      endRound(false);
      return;
    }
    const newDone = [...done, pos];
    setDone(newDone);
    if (expectedValue >= span) {
      endRound(true);
    } else {
      setNext(expectedValue + 1);
    }
  };

  return (
    <div>
      <div className="game-prompt">
        {studying ? t('games.chimp.study') : t('games.chimp.recall')}
      </div>
      <div
        className="game-grid"
        style={{ gridTemplateColumns: `repeat(${board.cols}, 1fr)`, maxWidth: 640 }}
      >
        {board.cells.map((value, pos) => {
          if (value == null) return <div key={pos} style={{ visibility: 'hidden' }} className="tile" />;
          const revealed = studying;
          const isDone = done.includes(pos);
          return (
            <button
              key={pos}
              className={`tile ${isDone ? 'correct' : revealed ? 'revealed' : 'hidden-tile'}`}
              onClick={() => handleCell(pos)}
              aria-label={revealed ? String(value) : t('games.chimp.hiddenTile')}
            >
              {revealed ? value : ''}
            </button>
          );
        })}
      </div>
      {studying && (
        <p className="game-subprompt" style={{ marginTop: 24 }}>{t('games.chimp.tapOneToStart')}</p>
      )}
    </div>
  );
}
