import React, { useMemo, useState } from 'react';
import { useLocale } from '../../context/LocaleContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { PageHead, Card, Skeleton } from '../../components/player/ui.jsx';
import MonthCalendar from '../../components/player/MonthCalendar.jsx';
import { GAMES } from '../../games/registry.js';

export default function CalendarPage() {
  const { t } = useLocale();
  const { progress, gameState } = usePlayer();
  const [selected, setSelected] = useState(null);

  const titleFor = useMemo(() => {
    const m = {};
    (gameState || []).forEach((g) => { m[g.slug] = g.title; });
    return m;
  }, [gameState]);

  const streaks = Object.entries(progress?.streakByGame || {})
    .filter(([, v]) => v.current > 0)
    .sort((a, b) => b[1].current - a[1].current);

  return (
    <div>
      <PageHead
        eyebrow={t('player.calendar.eyebrow')}
        title={t('player.calendar.title')}
        sub={t('player.dash.streaksPause')}
      />

      {!progress ? (
        <Skeleton height={320} />
      ) : (
        <>
          <div className="stat-grid" style={{ marginBottom: 22, maxWidth: 520 }}>
            <div className="stat-tile">
              <div className="num">{progress.currentStreak}</div>
              <div className="lab">{progress.streakPausedToday ? t('player.streakPaused') : t('player.dayStreak')}</div>
            </div>
            <div className="stat-tile">
              <div className="num">{progress.longestStreak}</div>
              <div className="lab">{t('player.calendar.best')}</div>
            </div>
            <div className="stat-tile">
              <div className="num">{progress.playDates.length}</div>
              <div className="lab">{t('player.calendar.daysPlayed')}</div>
            </div>
          </div>

          <div className="streak-cal" style={{ maxWidth: 520 }}>
            <MonthCalendar
              playDates={progress.playDates}
              selected={selected}
              onSelectDay={(d, c) => setSelected(c > 0 ? d : null)}
            />
          </div>

          {selected && (
            <Card className="pcard" style={{ marginTop: 16, maxWidth: 520 }}>
              <p className="eyebrow">{selected}</p>
              <p style={{ marginTop: 6, color: 'var(--ink-muted)' }}>
                {t('player.calendar.dayActivity', {
                  n: (progress.playDates.find((p) => p.date === selected)?.count) || 0,
                })}
              </p>
            </Card>
          )}

          {streaks.length > 0 && (
            <>
              <h2 className="font-display" style={{ fontSize: 'var(--text-xl)', margin: '30px 0 12px' }}>
                {t('player.calendar.perGame')}
              </h2>
              <div className="per-game-streaks" style={{ maxWidth: 520 }}>
                {streaks.map(([slug, v]) => (
                  <div className="row" key={slug}>
                    <span className="g">
                      <span aria-hidden>{GAMES[slug]?.meta.icon || '🎲'}</span>
                      {titleFor[slug] || slug}
                    </span>
                    <span className="chip accent">{t('player.dayStreakN', { n: v.current })}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
