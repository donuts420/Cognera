import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { PageHead, Card, EmptyState } from '../components/player/ui.jsx';

const BLANK = { display_name: '', village: '', district: '', state: '', birth_year: '', sex: 'F', preferred_locale: 'en', dementia_stage: 'unknown' };

export default function PatientsPage() {
  const { t } = useLocale();
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => { api.get('/patients').then(setPatients).catch(() => {}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await api.post('/patients', form);
      setPatients([...patients, { ...created, relationship: 'primary_caregiver', can_edit_care_plan: true }]);
      setShowForm(false);
      setForm(BLANK);
    } catch (err) {
      alert(err.data?.error?.message || t('error.failedToCreatePatient'));
    }
  };

  return (
    <div>
      <PageHead eyebrow={t('nav.careMode') || 'Care'} title={t('nav.patients')}>
        <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => setShowForm((s) => !s)}>
          {t('patient.add')}
        </button>
      </PageHead>

      {showForm && (
        <Card className="pcard" style={{ marginBottom: 24, maxWidth: 720 }}>
          <h3 className="font-display" style={{ fontSize: 'var(--text-lg)', marginBottom: 16 }}>{t('patient.add')}</h3>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {[['name', 'display_name'], ['village', 'village'], ['district', 'district'], ['state', 'state']].map(([lbl, key]) => (
              <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                {t(`patient.${lbl}`)}
                <input className="input" value={form[key]} onChange={set(key)} required={key === 'display_name'} />
              </label>
            ))}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              {t('patient.birthYear')}
              <input className="input" type="number" value={form.birth_year} onChange={set('birth_year')} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-sm)', fontWeight: 600 }}>
              {t('patient.stage')}
              <select className="input" value={form.dementia_stage} onChange={set('dementia_stage')}>
                <option value="unknown">{t('patient.unknown')}</option>
                <option value="at_risk">{t('patient.atRisk')}</option>
                <option value="mild">{t('patient.mild')}</option>
                <option value="moderate">{t('patient.moderate')}</option>
                <option value="severe">{t('patient.severe')}</option>
              </select>
            </label>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit">{t('common.save')}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
            </div>
          </form>
        </Card>
      )}

      {patients.length === 0 ? (
        <EmptyState glyph="sprout" title={t('common.noData')} />
      ) : (
        <div className="patient-list">
          {patients.map((p) => (
            <div key={p.id} className="patient-row">
              <span className="pr-avatar">{(p.display_name || '?').charAt(0).toUpperCase()}</span>
              <Link to={`/care/patients/${p.id}`} className="pr-main" style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="pr-name">{p.display_name}</span>
                <span className="pr-sub">{p.village || p.district || p.state || '–'} · {p.relationship}</span>
              </Link>
              <span className="pr-actions">
                <Link to={`/care/patients/${p.id}`} className="btn btn-ghost">{t('common.edit')}</Link>
                <Link to={`/care/patients/${p.id}/games`} className="btn btn-ghost">{t('nav.games')}</Link>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
