import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const { locale, setLocale, t } = useLocale();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
              setError(err.data?.error?.message || t('error.loginFailed'));
            } finally {
              setLoading(false);
            }
          },
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'rectangular',
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [googleLogin, navigate, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err.data?.error?.message || t('error.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-patient flex items-center justify-center auth-page">
      <div className="card auth-card">
        <div className="text-center mb-md">
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '28px', marginBottom: 'var(--gap-sm)' }}>C</div>
          <h1 style={{ fontSize: 'var(--text-xl)' }}>{t('app.name')}</h1>
          <p className="text-muted text-sm">{t('app.tagline')}</p>
        </div>
        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <>
            <div className="google-btn-wrap mb-md">
              <div ref={googleBtnRef} />
            </div>
            <div className="divider"><span className="text-sm text-muted">{t('common.or')}</span></div>
          </>
        )}
        <form onSubmit={handleSubmit}>
          <div className="input-group mb-md">
            <label htmlFor="identifier">{t('auth.identifier')}</label>
            <input id="identifier" className="input" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
          </div>
          <div className="input-group mb-md">
            <label htmlFor="password">{t('auth.password')}</label>
            <input id="password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p style={{ color: 'var(--danger)', marginBottom: 'var(--gap-md)' }}>{error}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading ? t('common.loading') : t('auth.login')}</button>
        </form>
        <div className="auth-footer">
          <p className="text-sm">{t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link></p>
          <button onClick={() => setLocale(locale === 'en' ? 'as' : 'en')} className="btn btn-ghost" style={{ minHeight: 36, fontSize: '14px', padding: '4px 16px' }}>
            {locale === 'en' ? t('lang.as') : t('lang.en')}
          </button>
        </div>
      </div>
    </div>
  );
}
