import Icon from '../components/Icon.jsx';
import React, { useEffect, useRef, useState } from 'react';
import { NER_OBJECTS, pick, shuffle, label } from './assets.js';

const ROUNDS = 5;

export default function FindObject({ level, t, locale, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const [round, setRound] = useState(0);
  const [scene, setScene] = useState([]);
  const [target, setTarget] = useState(null);
  const [found, setFound] = useState(false);
  const roundStart = useRef(Date.now());
  const wrongTaps = useRef(0);

  const buildRound = (r) => {
    const distractorCount = Math.min(20, 3 + level * 3 + r * 2);
    const chosen = pick(NER_OBJECTS, Math.min(NER_OBJECTS.length, distractorCount + 1));
    const tgt = chosen[0];
    const items = shuffle(chosen);
    setTarget(tgt);
    setScene(items);
    setFound(false);
    roundStart.current = Date.now();
    speak(t('games.find.prompt', { name: label(tgt.label, locale) }));
  };

  useEffect(() => {
    onProgress({ current: 0, total: ROUNDS });
    buildRound(0);
  }, []); // eslint-disable-line

  const handleTap = (obj) => {
    if (found || !target) return;
    const correct = obj.key === target.key;
    const elapsed = Date.now() - roundStart.current;
    onTrial({
      kind: 'search',
      correct,
      latency_ms: correct ? elapsed : null,
      payload: { target: target.key, distractors: scene.length - 1, wrongTaps: wrongTaps.current },
    });
    if (!correct) {
      wrongTaps.current += 1;
      onFeedback(t('games.find.lookAgain'));
      return;
    }
    setFound(true);
    onFeedback(t('games.find.foundIt'));
    const next = round + 1;
    onProgress({ current: next, total: ROUNDS });
    setTimeout(() => {
      if (next >= ROUNDS) {
        onComplete({ completed: true, rawScore: ROUNDS });
      } else {
        wrongTaps.current = 0;
        setRound(next);
        buildRound(next);
      }
    }, 1100);
  };

  return (
    <div>
      <div className="game-prompt">
        {target ? t('games.find.prompt', { name: label(target.label, locale) }) : ''}
      </div>
      <div className="scene-wrap">
        {scene.map((obj, i) => (
          <button
            key={`${obj.key}-${i}`}
            className={`scene-item ${found && obj.key === target.key ? 'found' : ''}`}
            onClick={() => handleTap(obj)}
            aria-label={label(obj.label, locale)}
          >
            <Icon name={obj.icon} />
          </button>
        ))}
      </div>
    </div>
  );
}
