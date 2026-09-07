import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../context/PatientContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function PatientModePage() {
  const { activePatient, exitPatientMode } = usePatient();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleExit = async () => {
    if (!showPin) { setShowPin(true); return; }
    if (pin.length !== 4) return;
    try {
      const res = await fetch('/api/patients/pin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: activePatient?.id, pin }),
      });
      const data = await res.json();
      if (data.valid) {
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

  return (
    <div className="layout-patient flex flex-col items-center justify-center p-lg">
      <div className="text-center">
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '36px', marginBottom: 'var(--gap-md)' }}>
          {activePatient?.display_name?.[0] || 'C'}
        </div>
        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--gap-sm)' }}>
          {activePatient?.display_name || t('app.name')}
        </h1>
        <p className="text-muted text-lg">{t('app.tagline')}</p>
      </div>
      <div className="flex flex-col gap-md mt-lg" style={{ width: '100%', maxWidth: 400 }}>
        <button className="btn btn-primary btn-lg btn-block">{t('game.play')}</button>
        <button className="btn btn-accent btn-lg btn-block">{t('reminder.medicine')}</button>
        <button className="btn btn-ghost btn-lg btn-block">{t('game.domain')}</button>
      </div>
      <div style={{ position: 'fixed', bottom: 32, right: 32 }}>
        {showPin ? (
          <div className="card" style={{ padding: 'var(--gap-md)' }}>
            <input
              className="input"
              type="password"
              maxLength={4}
              pattern="\d{4}"
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
              placeholder={t('patientMode.pinPlaceholder')}
              autoFocus
              style={{ width: 120, textAlign: 'center', fontSize: 'var(--text-xl)', letterSpacing: 8 }}
            />
            {error && <p className="text-sm" style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</p>}
            <div className="flex gap-sm mt-md">
              <button className="btn btn-primary" onClick={handleExit}>{t('patientMode.exit')}</button>
              <button className="btn btn-ghost" onClick={() => { setShowPin(false); setPin(''); setError(''); }}>{t('common.cancel')}</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-ghost" onClick={() => setShowPin(true)} style={{ fontSize: 'var(--text-sm)', minHeight: 48 }}>
            {t('patientMode.exitPatientMode')}
          </button>
        )}
      </div>
    </div>
  );
}
