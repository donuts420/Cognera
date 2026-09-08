import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { PageHead, SectionHead, Card, EmptyState } from '../components/player/ui.jsx';

const STAGE_TONE = { mild: 'info', at_risk: 'caution', moderate: 'caution', severe: 'crisis' };

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
      <PageHead eyebrow={t('nav.careMode') || 'Care'} title={t('dashboard.heading')} sub={t('dashboard.myPatients')} />

      <div className="dash-grid">
        <div className="dash-main">
          <SectionHead title={t('dashboard.myPatients')} />
          {patients.length === 0 ? (
            <EmptyState glyph="sprout" title={t('common.noData')} />
          ) : (
            <div className="patient-list">
              {patients.map((p) => (
                <Link key={p.id} to={`/care/patients/${p.id}`} className="patient-row">
                  <span className="pr-avatar">{(p.display_name || '?').charAt(0).toUpperCase()}</span>
                  <span className="pr-main">
                    <span className="pr-name">{p.display_name}</span>
                    <span className="pr-sub">{p.village || p.district || '—'}</span>
                  </span>
                  <span className={`chip ${STAGE_TONE[p.dementia_stage] || 'brand'}`}>
                    {t(`patient.${p.dementia_stage === 'at_risk' ? 'atRisk' : p.dementia_stage}`) || p.dementia_stage}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <aside className="dash-rail">
          <Card className="pcard">
            <SectionHead title={t('dashboard.alerts')} />
            {alerts.length === 0 ? (
              <p className="sub" style={{ color: 'var(--ink-muted)' }}>{t('dashboard.noActiveAlerts')}</p>
            ) : (
              <div className="alert-list">
                {alerts.slice(0, 8).map((a) => (
                  <div key={a.id} className="alert-row">
                    <div className="ar-head">
                      <span className={`chip ${a.severity === 'critical' ? 'crisis' : a.severity === 'high' ? 'caution' : 'info'}`}>
                        {a.severity}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)' }}>
                        {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="ar-body"><b>{a.patient_name}</b> · {a.title || a.kind}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
