import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocale } from '../../context/LocaleContext.jsx';
import { usePlayer } from '../../context/PlayerContext.jsx';
import GameHarness from '../../games/harness.jsx';
import { GAMES } from '../../games/registry.js';
import PlayerLoading from '../../components/player/PlayerLoading.jsx';

export default function GamePlayPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useLocale();
  const { patient, gameState, refreshGameState, refreshProgress, progress } = usePlayer();

  const [row, setRow] = useState(() => (gameState || []).find((g) => g.slug === slug) || null);
  const [replayKey, setReplayKey] = useState(0);
  const xpBefore = useRef(progress?.xp ?? 0);

  useEffect(() => {
    const found = (gameState || []).find((g) => g.slug === slug);
    if (found) { setRow(found); return; }
    if (!gameState) {
      refreshGameState().then((g) => setRow((g || []).find((x) => x.slug === slug) || null));
    }
  }, [slug, gameState, refreshGameState]);

  if (!GAMES[slug]) return <PlayerLoading error onRetry={() => navigate('/games')} />;
  if (!row) return <PlayerLoading />;

  const handleExit = async (res) => {
    const [freshState, fresh] = await Promise.all([refreshGameState(), refreshProgress()]);
    if (fresh && typeof fresh.xp === 'number') {
      const gained = fresh.xp - xpBefore.current;
      xpBefore.current = fresh.xp;
      if (gained > 0) {
        try { sessionStorage.setItem('cognera-xp-gain', String(gained)); } catch {}
      }
    }
    if (res?.again) {
      const updated = (freshState || []).find((g) => g.slug === slug);
      if (updated) setRow(updated);
      setReplayKey((k) => k + 1);
      return;
    }
    navigate('/games');
  };

  return <GameHarness key={replayKey} game={row} patient={patient} onExit={handleExit} />;
}
