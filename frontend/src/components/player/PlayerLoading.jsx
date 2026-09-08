import React from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';

export default function PlayerLoading({ error, onRetry }) {
  const { t } = useLocale();
  return (
    <div
      className="player-shell"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh' }}
    >
      <div className="pstate">
        <span className="mark" style={{
          width: 48, height: 48, borderRadius: 13, background: 'var(--accent)', color: 'var(--accent-fg)',
          display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 22,
        }}>C</span>
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
