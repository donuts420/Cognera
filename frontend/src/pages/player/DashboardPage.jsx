import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../context/LocaleContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { PageHead, SectionHead, Card, StatTile, EmptyState, Skeleton } from '../../components/player/ui.jsx';
import XpBar from '../../components/player/XpBar.jsx';
import HeroBanner from '../../components/player/HeroBanner.jsx';
import RecentRow from '../../components/player/RecentRow.jsx';
import GameTile from '../../components/player/GameTile.jsx';
import MonthCalendar from '../../components/player/MonthCalendar.jsx';
import Icon from '../../components/Icon.jsx';

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return 'player.goodMorning';
  if (h < 17) return 'player.goodAfternoon';
  return 'player.goodEvening';
}

export default function DashboardPage() {
  const { t, locale } = useLocale();
  const { patient, progress, gameState, favorites } = usePlayer();

  const firstName = (patient?.display_name || '').trim().split(' ')[0];
  const dateLabel = new Date().toLocaleDateString(
    locale === 'as' ? 'as-IN' : locale === 'hi' ? 'hi-IN' : 'en-IN',
    { weekday: 'long', month: 'long', day: 'numeric' }
  );

  const favGames = (gameState || []).filter((g) => favorites.has(g.slug));
  const nextMilestone = (progress?.milestones || []).find((m) => !m.earned);
  const brandNew = progress && progress.totalSessions === 0;

  return (
    <div>
      <PageHead
        eyebrow={dateLabel}
        title={`${t(greetingKey())}${firstName ? `, ${firstName}` : ''}.`}
        sub={brandNew ? t('player.dash.welcomeSub') : t('player.dash.sub')}
      />

      <div className="dash-grid">
        <div className="dash-main">
          {progress ? (
            <>
              <XpBar level={progress.level} xpInLevel={progress.xpInLevel} xpForNext={progress.xpForNext} />
              <HeroBanner progress={progress} gameState={gameState} />

              {progress.recent?.length > 0 && (
                <div>
                  <SectionHead title={t('player.dash.continue')} />
                  <RecentRow recent={progress.recent} />
                </div>
              )}

              <div className="stat-grid">
                <StatTile
                  num={progress.currentStreak}
                  label={progress.streakPausedToday ? t('player.streakPaused') : t('player.dayStreak')}
                />
                <StatTile num={progress.totalSessions} label={t('player.activities')} />
                <StatTile num={progress.minutesTotal} label={t('player.minutes')} />
              </div>

              {favGames.length > 0 && (
                <div>
                  <SectionHead title={t('player.dash.favorites')} to="/games" actionLabel={t('player.dash.allGames')} />
                  <div className="lib-grid">
                    {favGames.slice(0, 4).map((g) => <GameTile key={g.slug} game={g} />)}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Skeleton height={84} />
              <Skeleton height={190} />
              <Skeleton height={96} />
            </>
          )}
        </div>

        <aside className="dash-rail">
          <div className="mini-cal">
            <div className="cal-head" style={{ marginBottom: 10 }}>
              <span className="m" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                {t('player.dash.thisMonth')}
              </span>
              <Link to="/calendar" className="text-link">{t('player.dash.open')}</Link>
            </div>
            <MonthCalendar playDates={progress?.playDates || []} compact />
            <p className="sub" style={{ fontSize: 'var(--text-sm)', marginTop: 12, color: 'var(--ink-muted)' }}>
              {t('player.dash.streaksPause')}
            </p>
          </div>

          {nextMilestone && (
            <Link to="/milestones" style={{ textDecoration: 'none' }}>
              <Card className="pcard">
                <p className="eyebrow">{t('player.dash.nextMilestone')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                  <span className="ring" style={{
                    width: 52, height: 52, borderRadius: '50%', border: '2px solid var(--line-strong)',
                    display: 'grid', placeItems: 'center', color: 'var(--ink-faint)', flex: 'none',
                  }}><Icon name="medal" size={24} /></span>
                  <div>
                    <b style={{ display: 'block', color: 'var(--ink)' }}>{nextMilestone.title}</b>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-muted)' }}>{nextMilestone.hint}</span>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </aside>
      </div>

      {progress && progress.totalSessions === 0 && (
        <p style={{ textAlign: 'center', marginTop: 40, fontStyle: 'italic', color: 'var(--ink-faint)' }}>
          {t('player.dash.justBegin')}
        </p>
      )}
    </div>
  );
}
