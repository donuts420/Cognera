import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';
import GoogleButton, { GOOGLE_ENABLED } from '../components/GoogleButton.jsx';

export default function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', role: 'caregiver' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = useCallback(async (credential) => {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credential);
      navigate('/');
    } catch (err) {
      setError(err.data?.error?.message || t('error.registrationFailed'));
    } finally {
      setLoading(false);
    }
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
    <div className="auth-split">
      <div className="auth-left">
        <span className="arc" aria-hidden />
        <div className="wordmark">{t('app.name')}</div>
        <div>
          <h2>{t('auth.left.titleNew')}</h2>
          <ul>
            <li>{t('auth.left.p1')}</li>
            <li>{t('auth.left.p2')}</li>
            <li>{t('auth.left.p3')}</li>
          </ul>
        </div>
        <p className="quote">
          {t('auth.left.quote')}
          <span>{t('auth.left.quoteBy')}</span>
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-form">
          <h1>{t('auth.register')}</h1>
          <p className="lede">{t('auth.registerLede')}</p>

          {GOOGLE_ENABLED && (
            <>
              <GoogleButton onCredential={handleGoogle} text="signup_with" />
              <div className="divider">{t('common.or')}</div>
            </>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>{t('auth.fullName')}</label>
              <input className="input" type="text" value={form.full_name} onChange={update('full_name')} required />
            </div>
            <div className="field">
              <label>{t('auth.identifier')}</label>
              <input className="input" type="text" value={form.phone || form.email}
                onChange={(e) => setForm({ ...form, phone: e.target.value, email: '' })} required />
            </div>
            <div className="field">
              <label>{t('auth.password')}</label>
              <input className="input" type="password" value={form.password} onChange={update('password')} required minLength={8} />
            </div>
            <div className="field">
              <label>{t('auth.role')}</label>
              <select className="input" value={form.role} onChange={update('role')}>
                <option value="caregiver">{t('auth.caregiver')}</option>
                <option value="health_worker">{t('auth.healthWorker')}</option>
              </select>
            </div>
            {error && <p className="err">{error}</p>}
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('auth.register')}
            </button>
          </form>

          <div className="foot">
            <p>{t('auth.hasAccount')} <Link to="/login">{t('auth.login')}</Link></p>
            <button className="text-link" onClick={() => setLocale(locale === 'en' ? 'as' : 'en')}>
              {locale === 'en' ? t('lang.as') : t('lang.en')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
