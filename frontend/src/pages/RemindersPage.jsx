import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { PageHead, SectionHead, Card, EmptyState } from '../components/player/ui.jsx';
import Icon from '../components/Icon.jsx';

const TYPE_TONE = { medicine: 'crisis', hydration: 'info', activity: 'success', appointment: 'brand' };
const STATUS_TONE = { acknowledged: 'success', missed: 'crisis', snoozed: 'caution', pending: 'info', skipped: 'neutral' };

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
      <Link to={`/care/patients/${id}`} className="care-back">
        <Icon name="arrow-left" size={16} /> {t('common.back')}
      </Link>
      <PageHead eyebrow={t('nav.careMode') || 'Care'} title={t('nav.reminders')} />

      <div className="dash-grid">
        <div className="dash-main">
          <SectionHead title={t('reminder.activeReminders')} />
          {reminders.length === 0 ? (
            <EmptyState glyph="sprout" title={t('common.noData')} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reminders.map((r) => (
                <Card key={r.id} className="pcard">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className={`chip ${TYPE_TONE[r.type] || 'brand'}`}>{t(`reminder.${r.type}`)}</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-faint)' }}>
                      {r.times_of_day?.join(', ') || r.one_off_at}
                    </span>
                  </div>
                  <b style={{ color: 'var(--ink)' }}>{r.title}</b>
                  {r.medicine_name && (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>{r.medicine_name} — {r.dosage}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        <aside className="dash-rail">
          <SectionHead title={t('reminder.recentActivity')} />
          {occurrences.length === 0 ? (
            <p className="sub" style={{ color: 'var(--ink-muted)' }}>{t('common.noData')}</p>
          ) : (
            <div className="alert-list">
              {occurrences.slice(0, 10).map((o) => (
                <div key={o.id} className="alert-row">
                  <div className="ar-head">
                    <span className={`chip ${STATUS_TONE[o.status] || 'neutral'}`}>{t(`reminder.${o.status}`)}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-faint)' }}>
                      {new Date(o.scheduled_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="ar-body">{o.title || o.medicine_name}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
