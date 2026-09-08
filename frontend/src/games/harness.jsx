import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { computePerformance, detectFatigue } from '../../../shared/engine/index.js';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { useConnectivity } from '../context/ConnectivityContext.jsx';
import { narrate, stopSpeaking } from './voice.js';
import { chime } from './sound.js';
import { GAMES, normalizeDomains } from './registry.js';
import Icon from '../components/Icon.jsx';

const SESSION_CAP_MS = 12 * 60 * 1000; // sessions cap at twelve minutes
const OFFLINE_QUEUE_KEY = 'cognera-session-queue';

function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

function levelIndexFor(game) {
  const levels = game?.config?.levels || [];
  const raw = (game?.current_level ?? 1) - 1;
  return Math.max(0, Math.min(levels.length - 1, raw || 0));
}

export default function GameHarness({ game, patient, onExit }) {
  const { locale, t } = useLocale();
  const { online } = useConnectivity();
  const entry = GAMES[game.slug];
  const meta = entry?.meta || {};
  const Game = entry?.Component;

  const levels = game.config?.levels || [{ difficulty: 40 }];
  const [levelIdx] = useState(() => levelIndexFor(game));
  const levelConfig = levels[levelIdx] || {};
  const scored = meta.scored !== false;

  const [phase, setPhase] = useState('intro'); // intro | playing | paused | leaving | done
  const [voiceOn, setVoiceOn] = useState(!!meta.supportsVoice);
  const [feedback, setFeedback] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: meta.rounds || 0 });
  const [result, setResult] = useState(null);

  const trialsRef = useRef([]);
  const startRef = useRef(null);
  const capTimer = useRef(null);
  const finishedRef = useRef(false);

  const speak = useCallback(
    (text) => {
      if (voiceOn && text) narrate(text, locale);
    },
    [voiceOn, locale]
  );

  const introText = meta.instruction ? t(meta.instruction) : game.description;

  useEffect(() => {
    if (phase === 'intro') speak(introText);
    return () => stopSpeaking();
  }, [phase]); // eslint-disable-line

  const finish = useCallback(
    async (extra = {}) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      if (capTimer.current) clearTimeout(capTimer.current);
      stopSpeaking();

      const trials = trialsRef.current;
      const endedAt = new Date();
      const startedAt = startRef.current || endedAt;
      const latencies = trials.filter((x) => x.latency_ms != null).map((x) => x.latency_ms);
      const correct = trials.filter((x) => x.correct).length;
      const accuracy = trials.length ? correct / trials.length : 0;
      const perf = computePerformance(
        [...trials, extra.completed !== false ? { kind: 'session_complete' } : {}],
        median(latencies) || 2500
      );

      const session = {
        id: uuid(),
        game_id: game.slug,
        device_id: null,
        level: levelIdx,
        difficulty: levelConfig.difficulty ?? null,
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        duration_ms: endedAt - startedAt,
        trials_total: trials.length,
        trials_correct: correct,
        accuracy: Math.round(accuracy * 1000) / 1000,
        median_latency_ms: median(latencies),
        max_span: extra.maxSpan ?? null,
        raw_score: extra.rawScore ?? correct,
        performance: Math.round(perf * 1000) / 1000,
        trials,
        completed: extra.completed !== false,
        abandoned: !!extra.abandoned,
        ended_by_fatigue: !!extra.endedByFatigue,
        played_offline: !online,
      };

      if (scored) {
        try {
          if (online) {
            await api.post(`/patients/${patient.id}/sessions`, session);
          } else {
            queueOffline(patient.id, session);
          }
        } catch {
          queueOffline(patient.id, session);
        }
      }

      setResult({ session, ...extra });
      setPhase('done');
      if (scored) chime(true);
    },
    [game.slug, levelIdx, levelConfig, online, patient.id, scored]
  );

  const handleTrial = useCallback(
    (trial) => {
      const record = {
        ts: new Date().toISOString(),
        kind: trial.kind || 'response',
        correct: !!trial.correct,
        latency_ms: trial.latency_ms ?? null,
        difficulty: levelConfig.difficulty ?? null,
        payload: trial.payload || {},
      };
      trialsRef.current = [...trialsRef.current, record];
      if (detectFatigue(trialsRef.current)) {
        setFeedback(t('games.fatigueNote'));
        setTimeout(() => finish({ endedByFatigue: true, completed: true }), 900);
      }
    },
    [levelConfig, finish, t]
  );

  const gameApi = useMemo(
    () => ({
      level: levelIdx,
      levelConfig,
      locale,
      t,
      speak,
      onTrial: handleTrial,
      onProgress: (p) => setProgress((prev) => ({ ...prev, ...p })),
      onFeedback: (msg) => {
        setFeedback(msg || '');
        if (msg) speak(msg);
      },
      onComplete: (extra) => finish(extra || {}),
    }),
    [levelIdx, levelConfig, locale, t, speak, handleTrial, finish]
  );

  const beginPlay = () => {
    startRef.current = new Date();
    capTimer.current = setTimeout(() => finish({ endedByFatigue: false, completed: true }), SESSION_CAP_MS);
    setPhase('playing');
  };

  const confirmLeave = () => {
    stopSpeaking();
    if (capTimer.current) clearTimeout(capTimer.current);
    if (!finishedRef.current && trialsRef.current.length) {
      finish({ abandoned: true, completed: false }).then(() => onExit({ abandoned: true }));
    } else {
      onExit({ abandoned: true });
    }
  };

  const domainLabel = normalizeDomains(game.domains).map((d) => t(`game.${d}`)).join(' · ');

  return (
    <div className="game-root">
      <div className="game-topbar">
        <div>
          <h2>{game.title}</h2>
          <div className="text-sm text-muted">{domainLabel}</div>
        </div>
        {phase === 'playing' && progress.total > 0 && (
          <div className="game-progress" aria-label={t('games.progress')}>
            {Array.from({ length: progress.total }).map((_, i) => (
              <span
                key={i}
                className={`dot ${i < progress.current ? 'done' : i === progress.current ? 'current' : ''}`}
              />
            ))}
          </div>
        )}
        <div className="flex gap-sm">
          {meta.supportsVoice && (
            <button
              className="game-icon-btn"
              onClick={() => {
                setVoiceOn((v) => {
                  if (v) stopSpeaking();
                  return !v;
                });
              }}
              aria-pressed={voiceOn}
            >
              <span className="glyph"><Icon name={voiceOn ? 'sound-on' : 'sound-off'} size={26} /></span>
              {t('games.voice')}
            </button>
          )}
          {phase === 'playing' && (
            <button className="game-icon-btn" onClick={() => { stopSpeaking(); setPhase('paused'); }}>
              <span className="glyph"><Icon name="pause" size={26} /></span>
              {t('games.pause')}
            </button>
          )}
          {phase !== 'done' && (
            <button className="game-icon-btn" onClick={() => setPhase('leaving')}>
              <span className="glyph"><Icon name="close" size={26} /></span>
              {t('games.exit')}
            </button>
          )}
        </div>
      </div>

      <div className="game-stage">
        {phase === 'intro' && (
          <>
            <div style={{ marginBottom: 16, color: 'var(--accent)' }}><Icon name={meta.icon || 'dice'} size={72} /></div>
            <div className="game-prompt">{game.title}</div>
            <p className="game-subprompt">{introText}</p>
            <button className="btn btn-primary btn-lg" onClick={beginPlay}>
              {t('games.start')}
            </button>
          </>
        )}

        {(phase === 'playing' || phase === 'paused') && Game && (
          <div style={{ width: '100%', maxWidth: 900, opacity: phase === 'paused' ? 0.15 : 1 }}>
            <Game key={game.slug} {...gameApi} />
            {feedback && <div className="game-feedback">{feedback}</div>}
          </div>
        )}

        {phase === 'playing' && !Game && (
          <p className="game-subprompt">{t('games.comingSoon')}</p>
        )}

        {phase === 'done' && (
          <div className="game-panel" role="dialog" aria-modal="true">
            <div style={{ color: 'var(--success)' }}><Icon name="sprout" size={56} /></div>
            <h2>{t('games.wellDone')}</h2>
            <p>{summaryLine(result, t, scored)}</p>
            <div className="flex gap-sm" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-primary btn-lg" onClick={() => onExit({ played: true, again: true })}>
                {t('games.playAnother')}
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => onExit({ played: true })}>
                {t('games.done')}
              </button>
            </div>
          </div>
        )}
      </div>

      {phase === 'paused' && (
        <div className="game-overlay">
          <div className="game-panel">
            <div style={{ color: 'var(--ink-muted)' }}><Icon name="cup" size={52} /></div>
            <h2>{t('games.paused')}</h2>
            <p>{t('games.pausedNote')}</p>
            <div className="flex gap-sm">
              <button className="btn btn-primary btn-lg" onClick={() => setPhase('playing')}>
                {t('games.resume')}
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => setPhase('leaving')}>
                {t('games.exit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'leaving' && (
        <div className="game-overlay">
          <div className="game-panel">
            <div style={{ color: 'var(--ink-muted)' }}><Icon name="wave" size={52} /></div>
            <h2>{t('games.leaveTitle')}</h2>
            <p>{t('games.leaveNote')}</p>
            <div className="flex gap-sm">
              <button className="btn btn-ghost btn-lg" onClick={() => setPhase(trialsRef.current.length && !finishedRef.current ? 'paused' : 'playing')}>
                {t('games.keepPlaying')}
              </button>
              <button className="btn btn-primary btn-lg" onClick={confirmLeave}>
                {t('games.leave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function summaryLine(result, t, scored) {
  if (!scored) return t('games.reminisceSummary');
  const s = result?.session;
  if (!s) return t('games.genericSummary');
  if (result?.endedByFatigue) return t('games.fatigueSummary');
  if (s.max_span) return t('games.spanSummary', { n: s.max_span });
  const pct = Math.round((s.accuracy || 0) * 100);
  return t('games.accuracySummary', { n: pct });
}

function queueOffline(patientId, session) {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    const q = raw ? JSON.parse(raw) : [];
    q.push({ patientId, session, queuedAt: Date.now() });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(q));
  } catch {}
}

export async function flushOfflineSessions() {
  let q;
  try {
    q = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  } catch {
    return;
  }
  if (!q.length) return;
  const remaining = [];
  for (const item of q) {
    try {
      await api.post(`/patients/${item.patientId}/sessions`, item.session);
    } catch {
      remaining.push(item);
    }
  }
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  } catch {}
}
