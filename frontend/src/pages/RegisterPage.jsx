import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', role: 'caregiver' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        clearInterval(interval);
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          callback: async (response) => {
            setError('');
            setLoading(true);
            try {
              await googleLogin(response.credential);
              navigate('/');
            } catch (err) {
              setError(err.data?.error?.message || t('error.registrationFailed'));
            } finally {
              setLoading(false);
            }
          },
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [googleLogin, navigate, t]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.data?.error?.message || t('error.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-patient flex items-center justify-center">
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 'var(--gap-lg)' }}>
        <h1 className="text-center" style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--gap-md)' }}>{t('auth.register')}</h1>
        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <>
            <div ref={googleBtnRef} className="mb-md" style={{ minHeight: 44 }} />
            <div className="flex items-center gap-sm mb-md">
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span className="text-sm text-muted">{t('common.or')}</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
          </>
        )}
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
              <option value="caregiver">{t('auth.caregiver')}</option>
              <option value="health_worker">{t('auth.healthWorker')}</option>
            </select>
          </div>
          {error && <p style={{ color: 'var(--danger)', marginBottom: 'var(--gap-md)' }}>{error}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? t('common.loading') : t('auth.register')}</button>
        </form>
        <p className="text-center mt-md text-sm">{t('auth.hasAccount')} <Link to="/login">{t('auth.login')}</Link></p>
        <div className="text-center mt-md">
          <button onClick={() => setLocale(locale === 'en' ? 'as' : 'en')} className="btn btn-ghost" style={{ minHeight: 36, fontSize: '14px', padding: '4px 16px' }}>
            {locale === 'en' ? t('lang.as') : t('lang.en')}
          </button>
        </div>
      </div>
    </div>
  );
}
