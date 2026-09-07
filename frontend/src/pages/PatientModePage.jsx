import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import { useConnectivity } from '../context/ConnectivityContext.jsx';
import { api } from '../lib/api.js';
import GameLibrary from '../games/GameLibrary.jsx';
import GameHarness, { flushOfflineSessions } from '../games/harness.jsx';

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return 'games.goodMorning';
  if (h < 17) return 'games.goodAfternoon';
  return 'games.goodEvening';
}

export default function PatientModePage() {
  const { activePatient, exitPatientMode } = usePatient();
  const { t } = useLocale();
  const { online } = useConnectivity();
  const navigate = useNavigate();

  const [games, setGames] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const loadGames = () => {
    if (!activePatient?.id) return;
    api.get(`/patients/${activePatient.id}/game-state`).then(setGames).catch(() => setGames([]));
  };

  useEffect(() => { loadGames(); }, [activePatient?.id]); // eslint-disable-line
  useEffect(() => { if (online) flushOfflineSessions().then(loadGames); }, [online]); // eslint-disable-line

  const handleExit = async () => {
    if (!showPin) { setShowPin(true); return; }
    if (pin.length !== 4) return;
    try {
      const res = await fetch('/api/patients/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: activePatient?.id, pin }),
      });
      const data = await res.json().catch(() => ({}));
      // 404 => no exit PIN configured for this patient; don't trap the caregiver.
      if (data.valid || res.status === 404) {
        exitPatientMode();
        navigate('/');
      } else {
        setError(t('patientMode.incorrectPin'));
        setPin('');
      }
    } catch {
      setError(t('patientMode.verificationFailed'));
    }
  };

  if (activeGame) {
    return (
      <GameHarness
        game={activeGame}
        patient={activePatient}
        onExit={(res) => {
          setActiveGame(null);
          loadGames();
          if (res?.again) { /* stay on library */ }
        }}
      />
    );
  }

  const firstName = (activePatient?.display_name || '').split(' ')[0];

  return (
    <div className="layout-patient" style={{ overflowY: 'auto' }}>
      <header className="game-topbar">
        <div>
          <h2>{t('app.name')}</h2>
          <div className="text-sm text-muted">
            {online ? t('games.savedOnDevice') : t('games.offlineSaved')}
          </div>
        </div>
        <div className="flex gap-sm items-center">
          {showPin ? (
            <div className="flex gap-sm items-center">
              <input
                className="input"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
                placeholder={t('patientMode.pinPlaceholder')}
                autoFocus
                style={{ width: 110, textAlign: 'center', fontSize: 'var(--text-lg)', letterSpacing: 6 }}
              />
              <button className="btn btn-primary" onClick={handleExit}>{t('patientMode.exit')}</button>
              <button className="btn btn-ghost" onClick={() => { setShowPin(false); setPin(''); setError(''); }}>
                {t('common.cancel')}
              </button>
            </div>
          ) : (
            <button className="game-icon-btn" onClick={() => setShowPin(true)}>
              <span className="glyph">🏠</span>
              {t('patientMode.exitPatientMode')}
            </button>
          )}
        </div>
      </header>

      {error && (
        <p className="text-sm text-center" style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</p>
      )}

      <div className="flex flex-col items-center p-lg" style={{ gap: 'var(--gap-lg)' }}>
        <div className="text-center">
          <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 4 }}>
            {t(greetingKey())}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-muted text-lg">{t('games.pickActivity')}</p>
        </div>

        {games === null ? (
          <div className="empty-state">{t('common.loading')}</div>
        ) : (
          <GameLibrary games={games} onPick={(g) => setActiveGame(g)} />
        )}
      </div>
    </div>
  );
}
