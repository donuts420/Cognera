// Player-experience projections. Pure functions over the game_sessions log —
// no XP/streak is ever stored, it is always derived (same philosophy as
// skill_state being a projection). Kept dependency-free and testable.

const TZ = 'Asia/Kolkata';
const XP_PER_LEVEL = 100;

/** Local calendar date string (YYYY-MM-DD) for a timestamp in the patient tz. */
export function localDate(ts, tz = TZ) {
  const d = ts instanceof Date ? ts : new Date(ts);
  // en-CA gives YYYY-MM-DD
  return d.toLocaleDateString('en-CA', { timeZone: tz });
}

/** XP earned by one session row. Gentle: reward showing up + effort, not perfection. */
export function computeXp(s) {
  if (!s || s.completed === false || s.abandoned) return 0;
  const correct = Number(s.trials_correct) || 0;
  const spanBonus = s.max_span ? 4 : 0;
  return 10 + Math.min(20, 2 * correct) + spanBonus;
}

export function levelFor(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return { level, xpInLevel: xp % XP_PER_LEVEL, xpForNext: XP_PER_LEVEL };
}

/**
 * current + longest run of consecutive local days that appear in `dateSet`.
 * "Streaks pause, never break": if nothing today but there was yesterday, the
 * current streak is the run ending yesterday (not zero).
 */
export function streaksFromDates(dateSet, today = localDate(Date.now())) {
  if (!dateSet || dateSet.size === 0) return { current: 0, longest: 0, pausedToday: false };
  const dayMs = 86400000;
  const toDate = (s) => new Date(s + 'T00:00:00Z');
  const has = (s) => dateSet.has(s);
  const fmt = (d) => d.toISOString().slice(0, 10);

  // longest
  const sorted = [...dateSet].sort();
  let longest = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = toDate(sorted[i - 1]).getTime();
    const cur = toDate(sorted[i]).getTime();
    run = cur - prev === dayMs ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // current: walk back from today, then (if today missing) from yesterday
  let anchor = has(today) ? today : fmt(new Date(toDate(today).getTime() - dayMs));
  const pausedToday = !has(today) && has(anchor);
  let current = 0;
  if (has(anchor)) {
    let d = toDate(anchor).getTime();
    while (has(fmt(new Date(d)))) { current++; d -= dayMs; }
  }
  return { current, longest, pausedToday };
}

export const MILESTONE_DEFS = [
  { key: 'first-game',   title: 'First game',   hint: 'Play one activity' },
  { key: 'steady-3',     title: 'Three days',   hint: 'A 3-day streak' },
  { key: 'steady-week',  title: 'Steady week',  hint: 'A 7-day streak' },
  { key: 'explorer',     title: 'Explorer',     hint: 'Try 5 different games' },
  { key: 'all-games',    title: 'Every game',   hint: 'Try all the games' },
  { key: 'focused-mind', title: 'Focused mind', hint: 'Reach level 4 in any game' },
  { key: 'century',      title: 'One hundred',  hint: 'Earn 100 points' },
  { key: 'regular',      title: 'A regular',    hint: 'Play 20 activities' },
];

export function evaluateMilestones(stats) {
  const earnedKeys = {
    'first-game':  stats.totalSessions >= 1,
    'steady-3':    stats.longestStreak >= 3,
    'steady-week': stats.longestStreak >= 7,
    'explorer':    stats.distinctGames >= 5,
    'all-games':   stats.distinctGames >= stats.gameCount,
    'focused-mind': stats.maxLevel >= 4,
    'century':     stats.xp >= 100,
    'regular':     stats.totalSessions >= 20,
  };
  return MILESTONE_DEFS.map((m) => ({ ...m, earned: !!earnedKeys[m.key] }));
}
