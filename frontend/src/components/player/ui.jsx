import React from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';
import Icon from '../Icon.jsx';

export function Eyebrow({ children }) {
  return <p className="eyebrow">{children}</p>;
}

export function PageHead({ eyebrow, title, sub, children }) {
  return (
    <header className="page-head">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h1>{title}</h1>
      {sub && <p className="sub">{sub}</p>}
      {children}
    </header>
  );
}

export function SectionHead({ title, actionLabel, onAction, to }) {
  const Action = () => {
    if (to) return <a href={to}>{actionLabel}</a>;
    if (onAction) return <button className="text-link" onClick={onAction}>{actionLabel}</button>;
    return null;
  };
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {actionLabel && <Action />}
    </div>
  );
}

export function Card({ as: As = 'div', className = '', pad = true, children, ...rest }) {
  return (
    <As className={`pcard ${pad ? 'pcard-pad' : ''} ${className}`} {...rest}>
      {children}
    </As>
  );
}

export function Chip({ tone = 'neutral', children }) {
  return <span className={`chip ${tone}`}>{children}</span>;
}

export function StatTile({ num, label }) {
  return (
    <div className="stat-tile">
      <div className="num">{num}</div>
      <div className="lab">{label}</div>
    </div>
  );
}

export function EmptyState({ glyph = 'sprout', title, children }) {
  return (
    <div className="pstate">
      <span className="glyph" aria-hidden><Icon name={glyph} size={48} /></span>
      {title && <h3>{title}</h3>}
      {children && <p>{children}</p>}
    </div>
  );
}

export function ErrorState({ onRetry }) {
  const { t } = useLocale();
  return (
    <div className="pstate">
      <span className="glyph" aria-hidden><Icon name="leaf" size={48} /></span>
      <h3>{t('player.somethingOff')}</h3>
      <p>{t('player.tryAgainHint')}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry} style={{ marginTop: 8 }}>
          {t('player.tryAgain')}
        </button>
      )}
    </div>
  );
}

export function Skeleton({ height = 120, style }) {
  return <div className="skeleton" style={{ height, ...style }} />;
}
