import Icon from '../components/Icon.jsx';
import React, { useEffect, useRef, useState } from 'react';
import { SOUNDS, pick, shuffle, label } from './assets.js';
import { pattern as playPattern } from './sound.js';

const ROUNDS = 6;

export default function SoundRecognition({ level, locale, t, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const [round, setRound] = useState(0);
  const [choices, setChoices] = useState([]);
  const [target, setTarget] = useState(null);
  const [picked, setPicked] = useState(null);
  const [hint, setHint] = useState(false);
  const start = useRef(Date.now());
  const replays = useRef(0);

  const play = (snd) => { playPattern(snd.pattern, snd.freq); };

  const build = (r) => {
    const set = pick(SOUNDS, 4);
    const tgt = set[0];
    setTarget(tgt);
    setChoices(shuffle(set));
    setPicked(null);
    setHint(false);
    replays.current = 0;
    start.current = Date.now();
    setTimeout(() => play(tgt), 500);
  };

  useEffect(() => {
    onProgress({ current: 0, total: ROUNDS });
    build(0);
  }, []); // eslint-disable-line

  const choose = (snd) => {
    if (picked) return;
    const correct = snd.key === target.key;
    setPicked(snd.key);
    onTrial({
      kind: 'sound_id',
      correct,
      latency_ms: Date.now() - start.current,
      payload: { sound: target.key, replays: replays.current, usedHint: hint },
    });
    onFeedback(correct ? t('games.sound.yes') : t('games.calmOkay'));
    const next = round + 1;
    onProgress({ current: next, total: ROUNDS });
    setTimeout(() => {
      if (next >= ROUNDS) onComplete({ completed: true, rawScore: ROUNDS });
      else { setRound(next); build(next); }
    }, 1100);
  };

  return (
    <div>
      <div className="game-prompt">{t('games.sound.prompt')}</div>
      <div className="flex gap-sm" style={{ justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => { replays.current += 1; play(target); }}
        >
          <Icon name="replay" size={24} /> {t('games.sound.replay')}
        </button>
        <button className="btn btn-ghost btn-lg" onClick={() => setHint(true)}>
          <Icon name="bulb" size={24} /> {t('games.sound.hint')}
        </button>
      </div>
      {hint && target && (
        <p className="game-subprompt">{t('games.sound.hintText', { name: label(target.label, locale) })}</p>
      )}
      <div className="choice-row">
        {choices.map((snd) => (
          <button
            key={snd.key}
            className={`choice ${picked === snd.key ? (snd.key === target.key ? 'correct' : 'selected') : ''} ${picked && snd.key === target.key ? 'correct' : ''}`}
            onClick={() => choose(snd)}
          >
            <span className="glyph"><Icon name={snd.icon} /></span>
            {label(snd.label, locale)}
          </button>
        ))}
      </div>
    </div>
  );
}
