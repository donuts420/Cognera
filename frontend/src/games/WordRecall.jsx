import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FAMILIAR_WORDS, pick, shuffle } from './assets.js';

export default function WordRecall({ levelConfig, locale, t, speak, onTrial, onProgress, onFeedback, onComplete }) {
  const wordList = FAMILIAR_WORDS[locale] || FAMILIAR_WORDS.en;
  const n = Math.min(Math.floor((wordList.length) / 2), levelConfig.words || 5);

  const { studied, testItems } = useMemo(() => {
    const all = shuffle(wordList);
    const studySet = all.slice(0, n);
    const newSet = all.slice(n, n + n);
    const items = shuffle([
      ...studySet.map((w) => ({ word: w, seen: true })),
      ...newSet.map((w) => ({ word: w, seen: false })),
    ]);
    return { studied: studySet, testItems: items };
  }, [locale, n]);

  const [phase, setPhase] = useState('study'); // study | test
  const [studyIdx, setStudyIdx] = useState(0);
  const [testIdx, setTestIdx] = useState(0);
  const answerStart = useRef(0);
  const tally = useRef({ hit: 0, miss: 0, fp: 0, cr: 0 });

  useEffect(() => {
    onProgress({ current: 0, total: testItems.length });
    speak(t('games.word.study'));
  }, []); // eslint-disable-line

  useEffect(() => {
    if (phase !== 'study') return;
    speak(studied[studyIdx]);
    const id = setTimeout(() => {
      if (studyIdx + 1 >= studied.length) {
        setPhase('test');
        answerStart.current = Date.now();
        speak(t('games.word.haveYouSeen'));
      } else {
        setStudyIdx(studyIdx + 1);
      }
    }, 1900);
    return () => clearTimeout(id);
  }, [phase, studyIdx]); // eslint-disable-line

  const answer = (saidYes) => {
    if (phase !== 'test') return;
    const item = testItems[testIdx];
    const correct = saidYes === item.seen;
    if (item.seen && saidYes) tally.current.hit += 1;
    else if (item.seen && !saidYes) tally.current.miss += 1;
    else if (!item.seen && saidYes) tally.current.fp += 1;
    else tally.current.cr += 1;

    onTrial({
      kind: 'recognition',
      correct,
      latency_ms: Date.now() - answerStart.current,
      payload: { word: item.word, seen: item.seen, saidYes },
    });

    const next = testIdx + 1;
    onProgress({ current: next, total: testItems.length });
    onFeedback(correct ? t('games.word.good') : t('games.calmOkay'));
    setTimeout(() => {
      if (next >= testItems.length) {
        const { hit, fp } = tally.current;
        onComplete({
          completed: true,
          rawScore: hit,
          payload: { ...tally.current, false_positive_rate: fp / Math.max(1, n) },
        });
      } else {
        setTestIdx(next);
        answerStart.current = Date.now();
      }
    }, 650);
  };

  if (phase === 'study') {
    return (
      <div>
        <div className="game-prompt">{t('games.word.study')}</div>
        <div className="game-bignum" style={{ fontSize: 'clamp(44px, 12vw, 96px)' }}>{studied[studyIdx]}</div>
        <p className="game-subprompt">{t('games.word.wordOf', { a: studyIdx + 1, b: studied.length })}</p>
      </div>
    );
  }

  const item = testItems[testIdx];
  return (
    <div>
      <div className="game-prompt">{t('games.word.haveYouSeen')}</div>
      <div className="game-bignum" style={{ fontSize: 'clamp(44px, 12vw, 96px)' }}>{item.word}</div>
      <div className="choice-row" style={{ marginTop: 24 }}>
        <button className="choice" onClick={() => answer(true)} style={{ maxWidth: 260 }}>
          <span className="glyph">👍</span>
          {t('games.word.yes')}
        </button>
        <button className="choice" onClick={() => answer(false)} style={{ maxWidth: 260 }}>
          <span className="glyph">👋</span>
          {t('games.word.no')}
        </button>
      </div>
    </div>
  );
}
