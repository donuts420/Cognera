import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { PageHead, SectionHead, Card, StatTile } from '../components/player/ui.jsx';
import Icon from '../components/Icon.jsx';

const TREND_TONE = { improving: 'success', declining: 'crisis', stable: 'info' };

export default function PatientDetailPage() {
  const { id } = useParams();
  const { t } = useLocale();
  const [patient, setPatient] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    api.get(`/patients/${id}`).then(setPatient).catch(() => {});
    api.get(`/patients/${id}/analytics/overview`).then(setOverview).catch(() => {});
  }, [id]);

  if (!patient) return <p style={{ color: 'var(--ink-muted)' }}>{t('common.loading')}</p>;

  const stageLabel = t(`patient.${patient.dementia_stage === 'at_risk' ? 'atRisk' : patient.dementia_stage}`) || patient.dementia_stage;

  return (
    <div>
      <Link to="/care/patients" className="care-back">
        <Icon name="arrow-left" size={16} /> {t('common.back')}
      </Link>
      <PageHead
        eyebrow={`${patient.village || patient.district || '–'} · ${patient.preferred_locale}`}
        title={patient.display_name}
        sub={stageLabel}
      >
        <div className="detail-actions" style={{ marginTop: 14 }}>
          <Link to={`/care/patients/${id}/games`} className="btn btn-primary">{t('nav.games')}</Link>
          <Link to={`/care/patients/${id}/reminders`} className="btn btn-ghost">{t('nav.reminders')}</Link>
          <Link to={`/care/patients/${id}/assessments`} className="btn btn-ghost">{t('nav.assessments')}</Link>
        </div>
      </PageHead>

      {overview && (
        <>
          <div className="stat-grid" style={{ maxWidth: 560, marginBottom: 16 }}>
            <div className="stat-tile">
              <div className="num">{overview.cwi ?? '–'}</div>
              <div className="lab">{t('dashboard.cwi')}</div>
            </div>
            <StatTile num={overview.total_sessions} label={t('dashboard.sessions')} />
            <StatTile num={overview.total_minutes} label={t('dashboard.minutes')} />
          </div>
          <span className={`chip ${TREND_TONE[overview.trend_direction] || 'info'}`} style={{ marginBottom: 24, display: 'inline-flex' }}>
            {t(`dashboard.${overview.trend_direction}`)}
          </span>
        </>
      )}

      {patient.care_team && (
        <>
          <SectionHead title={t('patient.careTeam')} />
          <Card className="pcard" style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {patient.care_team.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{m.full_name || m.user_id}</span>
                  <span className="chip brand">{m.relationship}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
