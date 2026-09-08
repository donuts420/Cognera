import React from 'react';

/**
 * Compact SVG line chart of a metric over time. `series` is oldest→newest
 * numbers. Optional `refs` are horizontal reference lines [{ value, label }].
 * `lowerBetter` flips the fill direction so "good" is always toward the top.
 */
export default function MiniChart({ series = [], refs = [], lowerBetter = false, height = 140, unit = '' }) {
  const vals = series.filter((v) => v != null && !Number.isNaN(v));
  if (vals.length === 0) {
    return <div className="mini-chart empty">{'No data yet'}</div>;
  }

  const W = 320;
  const H = height;
  const padX = 8;
  const padY = 14;

  const allNums = [...vals, ...refs.map((r) => r.value).filter((v) => v != null)];
  let min = Math.min(...allNums);
  let max = Math.max(...allNums);
  if (min === max) { min -= 1; max += 1; }
  const range = max - min;
  min -= range * 0.12;
  max += range * 0.12;

  const x = (i) => padX + (vals.length === 1 ? W / 2 : (i / (vals.length - 1)) * (W - padX * 2));
  const y = (v) => {
    const t = (v - min) / (max - min);
    return padY + (1 - t) * (H - padY * 2);
  };

  const linePts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const areaPts = `${x(0)},${H - padY} ${linePts} ${x(vals.length - 1)},${H - padY}`;
  const last = vals[vals.length - 1];

  return (
    <svg className="mini-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img">
      <polygon points={areaPts} fill="var(--accent-subtle)" opacity="0.7" />
      {refs.map((r, i) =>
        r.value == null ? null : (
          <g key={i}>
            <line
              x1={padX} x2={W - padX} y1={y(r.value)} y2={y(r.value)}
              stroke="var(--ink-faint)" strokeWidth="1" strokeDasharray="4 4"
            />
            <text x={W - padX} y={y(r.value) - 4} textAnchor="end" fontSize="10" fill="var(--ink-faint)">
              {r.label}
            </text>
          </g>
        )
      )}
      <polyline points={linePts} fill="none" stroke="var(--accent)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />
      {vals.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === vals.length - 1 ? 4 : 2.5}
          fill={i === vals.length - 1 ? 'var(--accent)' : 'var(--surface)'} stroke="var(--accent)" strokeWidth="1.5" />
      ))}
      <text x={x(vals.length - 1)} y={y(last) - 10} textAnchor="end" fontSize="11" fontWeight="600" fill="var(--ink)">
        {Math.round(last)}{unit ? ` ${unit}` : ''}
      </text>
    </svg>
  );
}
