import React from 'react';
import logoUrl from '../assets/cognera-logo.svg';

// tone: 'ink' (black mark, for light backgrounds) | 'cream' (inverted, for dark backgrounds)
export default function Logo({ size = 40, tone = 'ink', className = '', style }) {
  return (
    <img
      src={logoUrl}
      alt="Cognera"
      width={size}
      height={size}
      className={`cognera-logo ${className}`}
      style={{
        display: 'block',
        objectFit: 'contain',
        filter: tone === 'cream' ? 'brightness(0) invert(1)' : 'none',
        ...style,
      }}
    />
  );
}
