import React, { useEffect, useState, useCallback } from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { api } from '../../lib/api.js';
import { PageHead, Card, Skeleton } from '../../components/player/ui.jsx';

export default function DailyPage() {
  const { t } = useLocale();
  const { patientId } = usePlayer();
  const [daily, setDaily] = useState(null);
  const [adding, setAdding] = useState(false);
  const [medForm, setMedForm] = useState({ name: '', dosage: '' });

  const load = useCallback(() => {
    if (!patientId) return;
    api.get(`/patients/${patientId}/daily`).then(setDaily).catch(() => setDaily({ hydration: { value: 0, target: 8 }, walk: { value: 0, target: 1 }, meals: { value: 0, target: 3 }, medicines: [] }));
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const bump = async (item_key, delta) => {
    const res = await api.post(`/patients/${patientId}/daily`, { item_key, delta }).catch(() => null);
    if (res) load();
  };
  const setValue = async (item_key, value) => {
    const res = await api.post(`/patients/${patientId}/daily`, { item_key, value }).catch(() => null);
    if (res) load();
  };
  const setMed = async (reminderId, taken) => {
    await api.post(`/patients/${patientId}/daily`, { item_key: `med:${reminderId}`, value: taken ? 1 : 0 }).catch(() => {});
    load();
  };
  const addMed = async (e) => {
    e.preventDefault();
    if (!medForm.name.trim()) return;
    await api.post(`/patients/${patientId}/reminders`, {
      type: 'medicine',
      title: medForm.name.trim(),
      medicine_name: medForm.name.trim(),
      dosage: medForm.dosage.trim() || null,
      times_of_day: ['09:00'],
    }).catch(() => {});
    setMedForm({ name: '', dosage: '' });
    setAdding(false);
    load();
  };

  return (
    <div>
      <PageHead eyebrow={t('player.nav.daily')} title={t('player.daily.title')} sub={t('player.daily.sub')} />

      {!daily ? (
        <div className="daily-grid">
          <Skeleton height={220} /><Skeleton height={220} />
        </div>
      ) : (
        <div className="daily-grid">
          {/* Hydration */}
          <div className="daily-card">
            <h3>{t('player.daily.water')}</h3>
            <p className="cap">{t('player.daily.waterCap', { n: daily.hydration.value, target: daily.hydration.target })}</p>
            <div className="glass-row">
              {Array.from({ length: Math.max(daily.hydration.target, daily.hydration.value) }).map((_, i) => (
                <button
                  key={i}
                  className={`glass ${i < daily.hydration.value ? 'full' : ''}`}
                  aria-label={t('player.daily.glass', { n: i + 1 })}
                  onClick={() => setValue('hydration', i + 1 === daily.hydration.value ? i : i + 1)}
                />
              ))}
            </div>
            <div className="counter-row">
              <button className="round-btn" onClick={() => bump('hydration', -1)} aria-label={t('common.cancel')}>−</button>
              <button className="round-btn primary" onClick={() => bump('hydration', 1)} aria-label={t('player.daily.addGlass')}>+</button>
              <span style={{ color: 'var(--ink-muted)' }}>{t('player.daily.oneGlass')}</span>
            </div>
          </div>

          {/* Walk + meals */}
          <div className="daily-card">
            <h3>{t('player.daily.movement')}</h3>
            <p className="cap">{t('player.daily.movementCap')}</p>
            <div className="counter-row" style={{ marginBottom: 20 }}>
              <span style={{ flex: 1, fontWeight: 600 }}>{t('player.daily.walk')}</span>
              <button className="round-btn" onClick={() => bump('walk', -1)}>−</button>
              <span className="big" style={{ fontSize: 'var(--text-2xl)' }}>{daily.walk.value}</span>
              <button className="round-btn primary" onClick={() => bump('walk', 1)}>+</button>
            </div>
            <div className="counter-row">
              <span style={{ flex: 1, fontWeight: 600 }}>{t('player.daily.meals')}</span>
              <button className="round-btn" onClick={() => bump('meal', -1)}>−</button>
              <span className="big" style={{ fontSize: 'var(--text-2xl)' }}>{daily.meals.value}</span>
              <button className="round-btn primary" onClick={() => bump('meal', 1)}>+</button>
            </div>
          </div>

          {/* Medicines */}
          <div className="daily-card" style={{ gridColumn: '1 / -1' }}>
            <h3>{t('player.daily.medicine')}</h3>
            <p className="cap">{t('player.daily.medicineCap')}</p>
            {daily.medicines.length === 0 && !adding && (
              <p style={{ color: 'var(--ink-faint)', marginBottom: 14 }}>{t('player.daily.noMeds')}</p>
            )}
            <div className="med-list">
              {daily.medicines.map((m) => (
                <div className="med-row" key={m.reminderId}>
                  <div className="info">
                    <b>{m.name}</b>
                    {m.dosage && <span>{m.dosage}</span>}
                  </div>
                  <button className={`taken-toggle ${m.taken ? 'on' : ''}`} onClick={() => setMed(m.reminderId, !m.taken)}>
                    {m.taken ? `✓ ${t('reminder.acknowledged')}` : t('player.daily.markTaken')}
                  </button>
                </div>
              ))}
            </div>
            {adding ? (
              <form onSubmit={addMed} style={{ marginTop: 16, display: 'grid', gap: 10, maxWidth: 420 }}>
                <input className="input" placeholder={t('player.daily.medName')} value={medForm.name}
                  onChange={(e) => setMedForm({ ...medForm, name: e.target.value })} autoFocus />
                <input className="input" placeholder={t('player.daily.medDose')} value={medForm.dosage}
                  onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-primary" type="submit">{t('common.save')}</button>
                  <button className="btn btn-ghost" type="button" onClick={() => setAdding(false)}>{t('common.cancel')}</button>
                </div>
              </form>
            ) : (
              <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setAdding(true)}>
                + {t('player.daily.addMedicine')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
