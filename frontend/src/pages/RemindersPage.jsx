import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';

export default function RemindersPage() {
  const { id } = useParams();
  const { t } = useLocale();
  const [reminders, setReminders] = useState([]);
  const [occurrences, setOccurrences] = useState([]);

  useEffect(() => {
    api.get(`/patients/${id}/reminders`).then(setReminders).catch(() => {});
    api.get(`/patients/${id}/occurrences`).then(setOccurrences).catch(() => {});
  }, [id]);

  return (
    <div>
      <Link to={`/patients/${id}`} className="text-sm text-muted" style={{ display: 'inline-block', marginBottom: 'var(--gap-md)' }}>&larr; {t('common.back')}</Link>
      <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--gap-lg)' }}>{t('nav.reminders')}</h1>
      <div className="grid-2">
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--gap-md)' }}>{t('reminder.activeReminders')}</h2>
          {reminders.length === 0 ? (
            <div className="empty-state card"><p>{t('common.noData')}</p></div>
          ) : (
            <div className="flex flex-col gap-sm">
              {reminders.map((r) => (
                <div key={r.id} className="card">
                  <div className="flex justify-between items-center">
                    <span className={`badge badge-${r.type === 'medicine' ? 'danger' : r.type === 'hydration' ? 'info' : 'success'}`}>{t(`reminder.${r.type}`)}</span>
                    <span className="text-sm text-muted">{r.times_of_day?.join(', ') || r.one_off_at}</span>
                  </div>
                  <p style={{ fontWeight: 600, marginTop: 'var(--gap-sm)' }}>{r.title}</p>
                  {r.medicine_name && <p className="text-sm text-muted">{r.medicine_name} — {r.dosage}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--gap-md)' }}>{t('reminder.recentActivity')}</h2>
          {occurrences.length === 0 ? (
            <div className="empty-state card"><p>{t('common.noData')}</p></div>
          ) : (
            <div className="flex flex-col gap-sm">
              {occurrences.slice(0, 10).map((o) => (
                <div key={o.id} className="card">
                  <div className="flex justify-between items-center">
                    <span className={`badge badge-${o.status === 'acknowledged' ? 'success' : o.status === 'missed' ? 'danger' : o.status === 'snoozed' ? 'warning' : 'info'}`}>
                      {t(`reminder.${o.status}`)}
                    </span>
                    <span className="text-sm text-muted">{new Date(o.scheduled_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm" style={{ marginTop: 'var(--gap-sm)' }}>{o.title || o.medicine_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
