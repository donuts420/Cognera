import React, { useMemo, useState } from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function ymd(d) {
  return d.toLocaleDateString('en-CA');
}

export default function MonthCalendar({ playDates = [], selected, onSelectDay, compact = false, monthOffset: extOffset }) {
  const { locale } = useLocale();
  const [offset, setOffset] = useState(extOffset ?? 0);

  const counts = useMemo(() => {
    const m = {};
    for (const p of playDates) m[p.date] = p.count;
    return m;
  }, [playDates]);

  const { cells, label } = useMemo(() => {
    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + offset);
    const year = base.getFullYear();
    const month = base.getMonth();
    const first = new Date(year, month, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out = [];
    for (let i = 0; i < startDow; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(year, month, d));
    const lbl = base.toLocaleDateString(locale === 'as' ? 'as-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN', {
      month: 'long', year: 'numeric',
    });
    return { cells: out, label: lbl };
  }, [offset, locale]);

  const today = ymd(new Date());

  const cls = (date) => {
    if (!date) return 'cal-cell empty';
    const key = ymd(date);
    const c = counts[key] || 0;
    let lv = '';
    if (c >= 3) lv = 'lv3';
    else if (c === 2) lv = 'lv2';
    else if (c === 1) lv = 'lv1';
    return `cal-cell ${lv} ${key === today ? 'today' : ''} ${selected === key ? 'sel' : ''}`;
  };

  return (
    <div>
      <div className="cal-head">
        <button className="text-link" onClick={() => setOffset((o) => o - 1)} aria-label="previous month">‹</button>
        <span className="m">{label}</span>
        <button
          className="text-link"
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          disabled={offset >= 0}
          aria-label="next month"
        >›</button>
      </div>
      <div className="cal-grid">
        {DOW.map((d, i) => <div key={i} className="cal-dow">{d}</div>)}
        {cells.map((date, i) =>
          date ? (
            <button
              key={i}
              className={cls(date)}
              onClick={() => onSelectDay && onSelectDay(ymd(date), counts[ymd(date)] || 0)}
              style={onSelectDay ? undefined : { cursor: 'default' }}
              tabIndex={onSelectDay ? 0 : -1}
            >
              {compact ? '' : date.getDate()}
            </button>
          ) : (
            <span key={i} className="cal-cell empty" />
          )
        )}
      </div>
    </div>
  );
}
