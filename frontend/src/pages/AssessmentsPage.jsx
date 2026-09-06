import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';

export default function AssessmentsPage() {
  const { id } = useParams();
  const { t } = useLocale();
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    api.get(`/patients/${id}/assessments`).then(setAssessments).catch(() => {});
  }, [id]);

  return (
    <div>
      <Link to={`/patients/${id}`} className="text-sm text-muted" style={{ display: 'inline-block', marginBottom: 'var(--gap-md)' }}>&larr; {t('common.back')}</Link>
      <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--gap-lg)' }}>{t('nav.assessments')}</h1>
      {assessments.length === 0 ? (
        <div className="empty-state card"><p>{t('common.noData')}</p></div>
      ) : (
        <div className="flex flex-col gap-md">
          {assessments.map((a) => (
            <div key={a.id} className="card">
              <div className="flex justify-between items-center">
                <div>
                  <span className="badge badge-info">{t(`assessment.${a.kind}`)}</span>
                  <span className="text-sm text-muted" style={{ marginLeft: 8 }}>{a.locale} · v{a.instrument_version}</span>
                </div>
                <span className="text-sm text-muted">{new Date(a.started_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-lg mt-md">
                <div>
                  <div className="text-sm text-muted">{t('assessment.score')}</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{a.total_score}/{a.max_score}</div>
                </div>
                {a.domain_scores && Object.entries(a.domain_scores).map(([domain, score]) => (
                  <div key={domain}>
                    <div className="text-sm text-muted">{t(`game.${domain}`)}</div>
                    <div style={{ fontWeight: 600 }}>{score}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
