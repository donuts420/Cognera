import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { PageHead, Card } from '../components/player/ui.jsx';
import Icon from '../components/Icon.jsx';

const FILTERS = [
  ['all', 'caseload.all'],
  ['declining', 'caseload.deteriorating'],
  ['disengaged', 'caseload.disengaged'],
  ['needs_visit', 'caseload.needsVisit'],
];

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
      <PageHead eyebrow={t('nav.careMode') || 'Care'} title={t('caseload.heading')} />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {FILTERS.map(([f, key]) => (
          <button
            key={f}
            className={`chip-btn ${filter === f ? 'on' : ''}`}
            onClick={() => setFilter(f)}
          >
            {t(key)}
          </button>
        ))}
      </div>

      <Card className="pcard" pad={false}>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('caseload.patient')}</th>
                <th>{t('caseload.village')}</th>
                <th className="num">{t('caseload.cwi')}</th>
                <th>{t('caseload.trend')}</th>
                <th className="num">{t('caseload.sessions')}</th>
                <th className="num">{t('caseload.completionRate')}</th>
                <th className="num">{t('caseload.alerts')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td><Link to={`/care/patients/${p.id}`}>{p.display_name}</Link></td>
                  <td>{p.village || '–'}</td>
                  <td className="num">{p.cwi ?? '–'}</td>
                  <td>
                    <span className={`chip ${p.trend_direction === 'improving' ? 'success' : p.trend_direction === 'declining' ? 'crisis' : 'info'}`}>
                      <Icon
                        name={p.trend_direction === 'improving' ? 'arrow-up' : p.trend_direction === 'declining' ? 'arrow-down' : 'minus'}
                        size={13}
                      />
                      {t(`dashboard.${p.trend_direction}`) || p.trend_direction}
                    </span>
                  </td>
                  <td className="num">{p.sessions_30d}</td>
                  <td className="num">{p.total_rem_30d > 0 ? Math.round((p.ack_30d / p.total_rem_30d) * 100) : 0}%</td>
                  <td className="num">
                    {p.open_alerts > 0 ? <span className="chip crisis">{p.open_alerts}</span> : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
