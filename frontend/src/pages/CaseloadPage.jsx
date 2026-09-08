import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';

export default function CaseloadPage() {
  const { t } = useLocale();
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/caseload/summary').then(setPatients).catch(() => {});
  }, []);

  const filtered = patients.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'declining') return p.trend_direction === 'declining';
    if (filter === 'disengaged') return parseInt(p.sessions_30d) < 3;
    if (filter === 'needs_visit') return parseInt(p.open_alerts) > 0;
    return true;
  });

  return (
    <div>
      <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--gap-lg)' }}>{t('caseload.heading')}</h1>
      <div className="flex gap-sm mb-lg">
        {['all', 'declining', 'disengaged', 'needs_visit'].map((f) => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)} style={{ minHeight: 48 }}>
            {f === 'all' ? t('caseload.all') : f === 'declining' ? t('caseload.deteriorating') : f === 'disengaged' ? t('caseload.disengaged') : t('caseload.needsVisit')}
          </button>
        ))}
      </div>
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: 'var(--text-sm)' }}>{t('caseload.patient')}</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: 'var(--text-sm)' }}>{t('caseload.village')}</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: 'var(--text-sm)' }}>{t('caseload.cwi')}</th>
              <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 'var(--text-sm)' }}>{t('caseload.trend')}</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: 'var(--text-sm)' }}>{t('caseload.sessions')}</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: 'var(--text-sm)' }}>{t('caseload.completionRate')}</th>
              <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: 'var(--text-sm)' }}>{t('caseload.alerts')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 8px' }}><Link to={`/care/patients/${p.id}`} style={{ fontWeight: 600 }}>{p.display_name}</Link></td>
                <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{p.village}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>{p.cwi ?? '—'}</td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  <span className={`badge badge-${p.trend_direction === 'improving' ? 'success' : p.trend_direction === 'declining' ? 'danger' : 'info'}`}>
                    {p.trend_direction === 'improving' ? '↑' : p.trend_direction === 'declining' ? '↓' : '→'}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right' }}>{p.sessions_30d}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                  {p.total_rem_30d > 0 ? Math.round((p.ack_30d / p.total_rem_30d) * 100) : 0}%
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                  {p.open_alerts > 0 && <span className="badge badge-danger">{p.open_alerts}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
