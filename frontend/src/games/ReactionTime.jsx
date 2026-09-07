import React, { useEffect, useRef, useState } from 'react';

export default function ReactionTime({ levelConfig, t, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const total = levelConfig.trials || 5;
  const [state, setState] = useState('idle'); // idle | wait | go | result
  const [trialNum, setTrialNum] = useState(0);
  const [lastRt, setLastRt] = useState(null);
  const goAt = useRef(0);
  const timer = useRef(null);
  const falseStarts = useRef(0);
  const rts = useRef([]);

  const scheduleGo = () => {
    setState('wait');
    const delay = 1500 + Math.random() * 3000;
    timer.current = setTimeout(() => {
      goAt.current = Date.now();
      setState('go');
    }, delay);
  };

  useEffect(() => {
    onProgress({ current: 0, total });
    speak(t('games.reaction.intro'));
    const id = setTimeout(scheduleGo, 800);
    return () => { clearTimeout(id); clearTimeout(timer.current); };
  }, []); // eslint-disable-line

  const handleTap = () => {
    if (state === 'wait') {
      clearTimeout(timer.current);
      falseStarts.current += 1;
      onTrial({ kind: 'false_start', correct: false, latency_ms: null, payload: {} });
      onFeedback(t('games.reaction.tooSoon'));
      setState('result');
      setTimeout(() => scheduleGo(), 1200);
      return;
    }
    if (state === 'go') {
      const rt = Date.now() - goAt.current;
      rts.current.push(rt);
      setLastRt(rt);
      onTrial({ kind: 'reaction', correct: true, latency_ms: rt, payload: { trial: trialNum + 1 } });
      const done = trialNum + 1;
      setTrialNum(done);
      onProgress({ current: done, total });
      setState('result');
      onFeedback(t('games.reaction.result', { ms: rt }));
      setTimeout(() => {
        if (done >= total) {
          const sorted = [...rts.current].sort((a, b) => a - b);
          const med = sorted[Math.floor(sorted.length / 2)] || null;
          onComplete({
            completed: true,
            rawScore: med,
            payload: { false_starts: falseStarts.current, fastest: sorted[0], slowest: sorted[sorted.length - 1] },
          });
        } else {
          scheduleGo();
        }
      }, 1300);
    }
  };

  const cls = state === 'go' ? 'go' : state === 'result' ? 'wait' : 'wait';
  const textFor = () => {
    if (state === 'go') return t('games.reaction.tapNow');
    if (state === 'result' && lastRt != null) return t('games.reaction.result', { ms: lastRt });
    return t('games.reaction.wait');
  };

  return (
    <div className="flex flex-col items-center gap-md">
      <div className="game-prompt">{t('games.reaction.prompt')}</div>
      <button className={`rt-target ${cls}`} onClick={handleTap} aria-label={textFor()}>
        {textFor()}
      </button>
      <p className="game-subprompt">{t('games.reaction.roundOf', { a: Math.min(trialNum + 1, total), b: total })}</p>
    </div>
  );
}
