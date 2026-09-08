import Icon from '../components/Icon.jsx';
import React, { useEffect, useRef, useState } from 'react';
import { shuffle, pick, PATTERN_SHAPES as SHAPES } from './assets.js';

const ROUNDS = 6;

export default function PatternComplete({ level, t, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const [round, setRound] = useState(0);
  const [seq, setSeq] = useState([]);
  const [options, setOptions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [picked, setPicked] = useState(null);
  const start = useRef(Date.now());
  const attempts = useRef(0);

  const build = (r) => {
    const cycleLen = Math.min(4, 2 + Math.floor((level + (r >= 3 ? 1 : 0)) / 1.5));
    const palette = pick(SHAPES, Math.max(cycleLen, 3));
    const cycle = Array.from({ length: cycleLen }, (_, i) => palette[i % palette.length]);
    const visibleLen = cycleLen * 2 + (r % 2);
    const full = Array.from({ length: visibleLen + 1 }, (_, i) => cycle[i % cycleLen]);
    const ans = full[visibleLen];
    const distractors = pick(palette.filter((s) => s !== ans).concat(SHAPES.filter((s) => !palette.includes(s))), 2);
    setSeq(full.slice(0, visibleLen));
    setAnswer(ans);
    setOptions(shuffle([ans, ...distractors]));
    setPicked(null);
    start.current = Date.now();
    attempts.current = 0;
    speak(t('games.pattern.prompt'));
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

  const choose = (opt) => {
    if (picked) return;
    attempts.current += 1;
    const correct = opt === answer;
    if (correct) {
      setPicked(opt);
      onTrial({ kind: 'pattern', correct: attempts.current === 1, latency_ms: Date.now() - start.current, payload: { attempts: attempts.current, cycle: seq.length } });
      onFeedback(t('games.pattern.yes'));
      advance();
    } else {
      onFeedback(t('games.pattern.notThatOne'));
      if (attempts.current >= 2) {
        setPicked(answer);
        onTrial({ kind: 'pattern', correct: false, latency_ms: Date.now() - start.current, payload: { attempts: attempts.current } });
        advance();
      }
    }
  };

  return (
    <div>
      <div className="game-prompt">{t('games.pattern.prompt')}</div>
      <div className="choice-row" style={{ marginBottom: 32 }}>
        {seq.map((s, i) => (
          <div key={i} className="choice" style={{ minHeight: 90, flex: '0 0 78px', cursor: 'default' }}>
            <span className="glyph"><Icon name={s} /></span>
          </div>
        ))}
        <div className="choice" style={{ minHeight: 90, flex: '0 0 78px', cursor: 'default', borderStyle: 'dashed' }}>
          <span className="glyph"><Icon name="question" /></span>
        </div>
      </div>
      <div className="choice-row">
        {options.map((opt, i) => (
          <button
            key={i}
            className={`choice ${picked === opt ? (opt === answer ? 'correct' : 'selected') : ''}`}
            onClick={() => choose(opt)}
          >
            <span className="glyph"><Icon name={opt} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}
