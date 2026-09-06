import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout-patient flex items-center justify-center">
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 'var(--gap-lg)' }}>
        <div className="text-center mb-md">
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '28px', marginBottom: 'var(--gap-sm)' }}>N</div>
          <h1 style={{ fontSize: 'var(--text-xl)' }}>{t('app.name')}</h1>
          <p className="text-muted text-sm">{t('app.tagline')}</p>
        </div>
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
        <p className="text-center mt-md text-sm">{t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link></p>
      </div>
    </div>
  );
}
