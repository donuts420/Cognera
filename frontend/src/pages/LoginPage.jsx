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
    <div className="auth-split">
      <div className="auth-left">
        <span className="arc" aria-hidden />
        <div className="wordmark">{t('app.name')}</div>
        <div>
          <h2>{t('auth.left.title')}</h2>
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
          <h1>{t('auth.welcomeBack')}</h1>
          <p className="lede">{t('auth.loginLede')}</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="identifier">{t('auth.identifier')}</label>
              <input id="identifier" className="input" type="text" value={identifier}
                onChange={(e) => setIdentifier(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">{t('auth.password')}</label>
              <input id="password" className="input" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="err">{error}</p>}
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? t('common.loading') : t('auth.login')}
            </button>
          </form>

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <>
              <div className="divider">{t('common.or')}</div>
              <div className="google-btn-wrap">
                <div ref={googleBtnRef} />
              </div>
            </>
          )}

          <div className="foot">
            <p>{t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link></p>
            <button className="text-link" onClick={() => setLocale(locale === 'en' ? 'as' : 'en')}>
              {locale === 'en' ? t('lang.as') : t('lang.en')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
