import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { PageHead, Card, EmptyState } from '../components/player/ui.jsx';
import Icon from '../components/Icon.jsx';

export default function AssessmentsPage() {
  const { id } = useParams();
  const { t } = useLocale();
  const [assessments, setAssessments] = useState([]);

  useEffect(() => {
    api.get(`/patients/${id}/assessments`).then(setAssessments).catch(() => {});
  }, [id]);

  return (
    <div>
      <Link to={`/care/patients/${id}`} className="care-back">
        <Icon name="arrow-left" size={16} /> {t('common.back')}
      </Link>
      <PageHead eyebrow={t('nav.careMode') || 'Care'} title={t('nav.assessments')} />

      {assessments.length === 0 ? (
        <EmptyState glyph="sprout" title={t('common.noData')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
          {assessments.map((a) => (
            <Card key={a.id} className="pcard">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="chip info">{t(`assessment.${a.kind}`)}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
                  {a.locale} · v{a.instrument_version} · {new Date(a.started_at).toLocaleDateString()}
                </span>
              </div>
              <div className="stat-grid" style={{ maxWidth: 520 }}>
                <div className="stat-tile">
                  <div className="num">{a.total_score}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>/{a.max_score}</span></div>
                  <div className="lab">{t('assessment.score')}</div>
                </div>
                {a.domain_scores && Object.entries(a.domain_scores).map(([domain, score]) => (
                  <div key={domain} className="stat-tile">
                    <div className="num">{score}</div>
                    <div className="lab">{t(`game.${domain}`)}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
