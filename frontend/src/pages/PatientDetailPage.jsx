import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';

export default function PatientDetailPage() {
  const { id } = useParams();
  const { t } = useLocale();
  const [patient, setPatient] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.get(`/patients/${id}`).then(setPatient).catch(() => {});
    api.get(`/patients/${id}/analytics/overview`).then(setOverview).catch(() => {});
  }, [id]);

  if (!patient) return <div className="empty-state">{t('common.loading')}</div>;

  return (
    <div>
      <Link to="/patients" className="text-sm text-muted" style={{ display: 'inline-block', marginBottom: 'var(--gap-md)' }}>&larr; {t('common.back')}</Link>
      <div className="flex justify-between items-center mb-lg">
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)' }}>{patient.display_name}</h1>
          <p className="text-muted">{patient.village || patient.district} · {patient.dementia_stage} · {patient.preferred_locale}</p>
        </div>
        <div className="flex gap-sm">
          <Link to={`/patients/${id}/games`} className="btn btn-primary">{t('nav.games')}</Link>
          <Link to={`/patients/${id}/reminders`} className="btn btn-accent">{t('nav.reminders')}</Link>
          <Link to={`/patients/${id}/assessments`} className="btn btn-ghost">{t('nav.assessments')}</Link>
        </div>
      </div>
      {overview && (
        <div className="grid-3 mb-lg">
          <div className="card text-center">
            <div className="text-sm text-muted">{t('dashboard.cwi')}</div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--primary)' }}>{overview.cwi ?? '—'}</div>
            <span className={`badge badge-${overview.trend_direction === 'improving' ? 'success' : overview.trend_direction === 'declining' ? 'danger' : 'info'}`}>
              {t(`dashboard.${overview.trend_direction}`)}
            </span>
          </div>
          <div className="card text-center">
            <div className="text-sm text-muted">{t('dashboard.sessions')}</div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>{overview.total_sessions}</div>
          </div>
          <div className="card text-center">
            <div className="text-sm text-muted">{t('dashboard.minutes')}</div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>{overview.total_minutes}</div>
          </div>
        </div>
      )}
      {patient.care_team && (
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--gap-md)' }}>Care Team</h2>
          <div className="flex flex-col gap-sm">
            {patient.care_team.map((m, i) => (
              <div key={i} className="flex justify-between items-center">
                <span>{m.full_name || m.user_id}</span>
                <span className="badge badge-info">{m.relationship}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
