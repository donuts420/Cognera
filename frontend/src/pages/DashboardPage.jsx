import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';

export default function DashboardPage() {
  const { t } = useLocale();
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get('/patients').then(setPatients).catch(() => {});
    api.get('/alerts/feed').then(setAlerts).catch(() => {});
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--gap-lg)' }}>{t('dashboard.heading')}</h1>
      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--gap-md)' }}>{t('dashboard.myPatients')}</h2>
          {patients.length === 0 ? (
            <div className="empty-state"><p>{t('common.noData')}</p></div>
          ) : (
            <div className="flex flex-col gap-sm">
              {patients.map((p) => (
                <Link key={p.id} to={`/patients/${p.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.display_name}</div>
                      <div className="text-sm text-muted">{p.village || p.district}</div>
                    </div>
                    <span className={`badge ${p.dementia_stage === 'mild' ? 'badge-info' : p.dementia_stage === 'moderate' ? 'badge-warning' : 'badge-success'}`}>
                      {p.dementia_stage}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--gap-md)' }}>{t('dashboard.alerts')}</h2>
          {alerts.length === 0 ? (
            <div className="empty-state"><p>{t('dashboard.noActiveAlerts')}</p></div>
          ) : (
            <div className="flex flex-col gap-sm">
              {alerts.slice(0, 10).map((a) => (
                <div key={a.id} className="card" style={{ background: 'var(--surface-alt)' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`badge badge-${a.severity === 'critical' ? 'danger' : a.severity}`}>{a.severity}</span>
                      <span className="text-sm text-muted" style={{ marginLeft: 8 }}>{a.patient_name}</span>
                    </div>
                    <span className="text-sm text-muted">{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm mt-sm">{a.title || a.kind}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
