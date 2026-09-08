import React from 'react';
import Icon from '../../components/Icon.jsx';
import { useLocale } from '../../context/LocaleContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import { PageHead, Skeleton } from '../../components/player/ui.jsx';

const GLYPH = {
  'first-game': 'sprout',
  'steady-3': 'leaf',
  'steady-week': 'sprout',
  'explorer': 'compass',
  'all-games': 'map',
  'focused-mind': 'target',
  'century': 'hundred',
  'regular': 'star',
};

export default function MilestonesPage() {
  const { t } = useLocale();
  const { progress } = usePlayer();
  const milestones = progress?.milestones || [];
  const earned = milestones.filter((m) => m.earned).length;

  return (
    <div>
      <PageHead
        eyebrow={t('player.milestones.eyebrow')}
        title={t('player.milestones.title')}
        sub={t('player.milestones.sub', { n: earned, total: milestones.length })}
      />
      {!progress ? (
        <div className="milestone-grid">
          {[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={150} />)}
        </div>
      ) : (
        <div className="milestone-grid">
          {milestones.map((m) => (
            <div key={m.key} className={`milestone ${m.earned ? 'earned' : ''}`}>
              <div className="ring"><Icon name={m.earned ? (GLYPH[m.key] || 'medal') : 'lock'} size={34} /></div>
              <div className="m-title">{m.title}</div>
              <div className="m-hint">{m.hint}</div>
            </div>
          ))}
        </div>
      )}
      <p style={{ textAlign: 'center', marginTop: 40, fontStyle: 'italic', color: 'var(--ink-faint)' }}>
        {t('player.milestones.footer')}
      </p>
    </div>
  );
}
