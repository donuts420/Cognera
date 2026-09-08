import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from './AuthContext.jsx';
import { useLocale } from './LocaleContext.jsx';

const PlayerContext = createContext(null);
const SELF_KEY = 'cognera-self-patient';

/**
 * Resolves the "self patient" for the logged-in user (the docs' model is that
 * patients don't have accounts, so the player IS a patient record owned by their
 * caregiver user). Also owns the derived progress payload and the favorites set.
 */
export function PlayerProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { locale } = useLocale();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [progress, setProgress] = useState(null);
  const [favorites, setFavorites] = useState(() => new Set());
  const [gameState, setGameState] = useState(null); // cached game-state rows
  const resolving = useRef(false);

  const resolvePatient = useCallback(async () => {
    if (resolving.current) return;
    resolving.current = true;
    setLoading(true);
    setError(null);
    try {
      const me = await api.get('/auth/me');
      let pid = null;
      const stored = (() => { try { return localStorage.getItem(SELF_KEY); } catch { return null; } })();
      const list = me.patients || [];
      if (stored && list.some((p) => p.patient_id === stored)) {
        pid = stored;
      } else if (list.length) {
        pid = list[0].patient_id;
      } else {
        const created = await api.post('/patients', {
          display_name: me.full_name || user?.full_name || 'Me',
          preferred_locale: locale || 'en',
        });
        pid = created.id;
      }
      try { localStorage.setItem(SELF_KEY, pid); } catch {}
      const detail = list.find((p) => p.patient_id === pid);
      setPatient({ id: pid, display_name: detail?.display_name || me.full_name || 'Me' });
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
      resolving.current = false;
    }
  }, [user, locale]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setPatient(null); setProgress(null); setLoading(false); return; }
    resolvePatient();
  }, [authLoading, user, resolvePatient]);

  const refreshProgress = useCallback(async () => {
    if (!patient?.id) return null;
    try {
      const p = await api.get(`/patients/${patient.id}/progress`);
      setProgress(p);
      return p;
    } catch {
      return null;
    }
  }, [patient?.id]);

  const refreshFavorites = useCallback(async () => {
    if (!patient?.id) return;
    try {
      const f = await api.get(`/patients/${patient.id}/favorites`);
      setFavorites(new Set(f));
    } catch {}
  }, [patient?.id]);

  const refreshGameState = useCallback(async () => {
    if (!patient?.id) return null;
    try {
      const g = await api.get(`/patients/${patient.id}/game-state`);
      setGameState(g);
      return g;
    } catch { return null; }
  }, [patient?.id]);

  useEffect(() => {
    if (patient?.id) {
      refreshProgress();
      refreshFavorites();
      refreshGameState();
    }
  }, [patient?.id, refreshProgress, refreshFavorites, refreshGameState]);

  const toggleFavorite = useCallback(async (slug) => {
    if (!patient?.id) return;
    const has = favorites.has(slug);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (has) next.delete(slug);
      else next.add(slug);
      return next;
    });
    try {
      if (has) await api.delete(`/patients/${patient.id}/favorites/${slug}`);
      else await api.put(`/patients/${patient.id}/favorites/${slug}`);
    } catch {
      refreshFavorites();
    }
  }, [patient?.id, favorites, refreshFavorites]);

  const value = {
    patient,
    patientId: patient?.id || null,
    loading,
    error,
    progress,
    favorites,
    gameState,
    refreshProgress,
    refreshFavorites,
    refreshGameState,
    toggleFavorite,
    retry: resolvePatient,
  };
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
