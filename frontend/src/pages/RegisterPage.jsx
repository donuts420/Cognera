import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', role: 'caregiver' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.data?.error?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-patient flex items-center justify-center">
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 'var(--gap-lg)' }}>
        <h1 className="text-center" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--gap-md)' }}>{t('auth.register')}</h1>
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-md">
            <label>{t('auth.fullName')}</label>
            <input className="input" type="text" value={form.full_name} onChange={update('full_name')} required />
          </div>
          <div className="input-group mb-md">
            <label>{t('auth.identifier')}</label>
            <input className="input" type="text" value={form.phone || form.email} onChange={(e) => setForm({ ...form, phone: e.target.value, email: '' })} required />
          </div>
          <div className="input-group mb-md">
            <label>{t('auth.password')}</label>
            <input className="input" type="password" value={form.password} onChange={update('password')} required minLength={8} />
          </div>
          <div className="input-group mb-md">
            <label>{t('auth.role')}</label>
            <select className="input" value={form.role} onChange={update('role')}>
              <option value="caregiver">Caregiver</option>
              <option value="health_worker">Health Worker</option>
            </select>
          </div>
          {error && <p style={{ color: 'var(--danger)', marginBottom: 'var(--gap-md)' }}>{error}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? t('common.loading') : t('auth.register')}</button>
        </form>
        <p className="text-center mt-md text-sm">{t('auth.hasAccount')} <Link to="/login">{t('auth.login')}</Link></p>
      </div>
    </div>
  );
}
