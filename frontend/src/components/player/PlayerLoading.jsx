import React from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';
import Logo from '../Logo.jsx';

export default function PlayerLoading({ error, onRetry }) {
  const { t } = useLocale();
  return (
    <div
      className="player-shell"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}
    >
      <div className="pstate">
        <Logo size={72} className="logo-pulse" style={{ marginBottom: 4 }} />
        {error ? (
          <>
            <h3>{t('player.loadError')}</h3>
            <p>{t('player.loadErrorHint')}</p>
            {onRetry && (
              <button className="btn btn-primary" onClick={onRetry} style={{ marginTop: 8 }}>
                {t('player.tryAgain')}
              </button>
            )}
          </>
        ) : (
          <p>{t('common.loading')}</p>
        )}
      </div>
    </div>
  );
}
