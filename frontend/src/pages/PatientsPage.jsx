import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useLocale } from '../context/LocaleContext.jsx';
import { usePatient } from '../context/PatientContext.jsx';

export default function PatientsPage() {
  const { t } = useLocale();
  const { enterPatientMode } = usePatient();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ display_name: '', village: '', district: '', state: '', birth_year: '', sex: 'F', preferred_locale: 'en', dementia_stage: 'unknown' });

  useEffect(() => { api.get('/patients').then(setPatients).catch(() => {}); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await api.post('/patients', form);
      setPatients([...patients, { ...created, relationship: 'primary_caregiver', can_edit_care_plan: true }]);
      setShowForm(false);
      setForm({ display_name: '', village: '', district: '', state: '', birth_year: '', sex: 'F', preferred_locale: 'en', dementia_stage: 'unknown' });
    } catch (err) {
      alert(err.data?.error?.message || 'Failed to create patient');
    }
  };

  const handleEnterPatientMode = (patient) => {
    enterPatientMode(patient);
    navigate('/play');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-lg">
        <h1 style={{ fontSize: 'var(--text-2xl)' }}>{t('nav.patients')}</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>{t('patient.add')}</button>
      </div>
      {showForm && (
        <div className="card mb-lg">
          <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--gap-md)' }}>{t('patient.add')}</h2>
          <form onSubmit={handleCreate} className="grid-2">
            <div className="input-group">
              <label>{t('patient.name')}</label>
              <input className="input" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} required />
            </div>
            <div className="input-group">
              <label>{t('patient.village')}</label>
              <input className="input" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
            </div>
            <div className="input-group">
              <label>{t('patient.district')}</label>
              <input className="input" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="input-group">
              <label>{t('patient.state')}</label>
              <input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div className="input-group">
              <label>{t('patient.birthYear')}</label>
              <input className="input" type="number" value={form.birth_year} onChange={(e) => setForm({ ...form, birth_year: e.target.value })} />
            </div>
            <div className="input-group">
              <label>{t('patient.stage')}</label>
              <select className="input" value={form.dementia_stage} onChange={(e) => setForm({ ...form, dementia_stage: e.target.value })}>
                <option value="unknown">Unknown</option>
                <option value="at_risk">At Risk</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
            <div className="flex gap-sm" style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" type="submit">{t('common.save')}</button>
              <button className="btn btn-ghost" type="button" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
            </div>
          </form>
        </div>
      )}
      <div className="flex flex-col gap-md">
        {patients.map((p) => (
          <div key={p.id} className="card flex justify-between items-center">
            <div>
              <Link to={`/patients/${p.id}`} style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>{p.display_name}</Link>
              <div className="text-sm text-muted">{p.village || p.district || p.state} · {p.relationship}</div>
            </div>
            <div className="flex gap-sm">
              <button className="btn btn-accent" onClick={() => handleEnterPatientMode(p)}>{t('game.play')}</button>
              <Link to={`/patients/${p.id}/games`} className="btn btn-ghost">{t('nav.games')}</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
