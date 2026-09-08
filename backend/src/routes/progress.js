import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { requirePatientAccess } from '../middleware/patientAccess.js';
import {
  computeXp, levelFor, streaksFromDates, localDate, evaluateMilestones,
} from '../lib/progress.js';

const router = Router();
router.use(authenticate);

/* ────────────────────────────────  PROGRESS  ──────────────────────────────── */

router.get('/patients/:patientId/progress', requirePatientAccess, async (req, res) => {
  try {
    const pid = req.params.patientId;
    const today = localDate(Date.now());

    const [sessionsRes, favRes, gamesRes, skillRes] = await Promise.all([
      query(
        `SELECT game_id, trials_correct, max_span, duration_ms, completed, abandoned,
                client_created_at
           FROM game_sessions
          WHERE patient_id = $1
          ORDER BY client_created_at DESC`,
        [pid]
      ),
      query(`SELECT game_id FROM game_favorites WHERE patient_id = $1`, [pid]),
      query(`SELECT slug, title, icon_key, is_scored FROM games WHERE is_active = true ORDER BY sort_order`, []),
      query(`SELECT game_id, current_level, last_played_at FROM skill_state WHERE patient_id = $1`, [pid]),
    ]);

    const sessions = sessionsRes.rows;
    const gameMeta = Object.fromEntries(gamesRes.rows.map((g) => [g.slug, g]));
    const skill = Object.fromEntries(skillRes.rows.map((s) => [s.game_id, s]));

    let xp = 0;
    let minutesTotal = 0;
    let minutesToday = 0;
    let sessionsToday = 0;
    const dateSet = new Set();
    const perGameDates = {};
    const recentSeen = new Set();
    const recent = [];
    const playCounts = {}; // date -> count
    const distinct = new Set();
    let maxLevel = 0;

    for (const s of sessions) {
      const day = localDate(s.client_created_at);
      xp += computeXp(s);
      minutesTotal += (Number(s.duration_ms) || 0) / 60000;
      if (day === today) {
        minutesToday += (Number(s.duration_ms) || 0) / 60000;
        sessionsToday += 1;
      }
      dateSet.add(day);
      (perGameDates[s.game_id] = perGameDates[s.game_id] || new Set()).add(day);
      playCounts[day] = (playCounts[day] || 0) + 1;
      distinct.add(s.game_id);
      if (!recentSeen.has(s.game_id) && recent.length < 6) {
        recentSeen.add(s.game_id);
        const g = gameMeta[s.game_id] || {};
        recent.push({
          slug: s.game_id,
          title: g.title || s.game_id,
          icon: g.icon_key || null,
          lastPlayed: s.client_created_at,
          level: skill[s.game_id]?.current_level ?? 1,
        });
      }
    }

    for (const s of skillRes.rows) maxLevel = Math.max(maxLevel, Number(s.current_level) || 0);

    const { level, xpInLevel, xpForNext } = levelFor(xp);
    const { current: currentStreak, longest: longestStreak, pausedToday } =
      streaksFromDates(dateSet, today);

    const streakByGame = {};
    for (const [slug, dset] of Object.entries(perGameDates)) {
      const st = streaksFromDates(dset, today);
      streakByGame[slug] = { current: st.current, lastPlayed: skill[slug]?.last_played_at ?? null };
    }

    // last 90 local days of activity for the calendar heatmap
    const playDates = Object.entries(playCounts)
      .filter(([d]) => (Date.now() - new Date(d + 'T00:00:00Z').getTime()) < 95 * 86400000)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Today's activity: a scored game not played today — prefer never-played,
    // else the one least recently played.
    const scoredSlugs = gamesRes.rows.filter((g) => g.is_scored !== false).map((g) => g.slug);
    const playedTodaySet = new Set(
      sessions.filter((s) => localDate(s.client_created_at) === today).map((s) => s.game_id)
    );
    let recommended = null;
    const neverPlayed = scoredSlugs.filter((sl) => !skill[sl] && !playedTodaySet.has(sl));
    if (neverPlayed.length) {
      recommended = neverPlayed[0];
    } else {
      const candidates = scoredSlugs
        .filter((sl) => !playedTodaySet.has(sl))
        .map((sl) => ({ sl, t: skill[sl]?.last_played_at ? new Date(skill[sl].last_played_at).getTime() : 0 }))
        .sort((a, b) => a.t - b.t);
      recommended = candidates[0]?.sl || scoredSlugs[0] || null;
    }

    const milestones = evaluateMilestones({
      totalSessions: sessions.length,
      longestStreak,
      distinctGames: distinct.size,
      gameCount: gamesRes.rows.length,
      maxLevel,
      xp,
    });

    res.json({
      xp,
      level,
      xpInLevel,
      xpForNext,
      totalSessions: sessions.length,
      minutesTotal: Math.round(minutesTotal),
      minutesToday: Math.round(minutesToday),
      sessionsToday,
      playedEnoughToday: minutesToday >= 12,
      currentStreak,
      longestStreak,
      streakPausedToday: pausedToday,
      streakByGame,
      recent,
      playDates,
      milestones,
      recommended,
    });
  } catch (err) {
    console.error('Progress error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to load progress' } });
  }
});

/* ────────────────────────────────  FAVORITES  ─────────────────────────────── */

router.get('/patients/:patientId/favorites', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT game_id FROM game_favorites WHERE patient_id = $1 ORDER BY created_at`,
      [req.params.patientId]
    );
    res.json(rows.map((r) => r.game_id));
  } catch (err) {
    console.error('List favorites error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to load favorites' } });
  }
});

router.put('/patients/:patientId/favorites/:gameId', requirePatientAccess, async (req, res) => {
  try {
    await query(
      `INSERT INTO game_favorites (patient_id, game_id) VALUES ($1, $2)
       ON CONFLICT (patient_id, game_id) DO NOTHING`,
      [req.params.patientId, req.params.gameId]
    );
    res.json({ ok: true, favorite: true });
  } catch (err) {
    console.error('Add favorite error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to add favorite' } });
  }
});

router.delete('/patients/:patientId/favorites/:gameId', requirePatientAccess, async (req, res) => {
  try {
    await query(
      `DELETE FROM game_favorites WHERE patient_id = $1 AND game_id = $2`,
      [req.params.patientId, req.params.gameId]
    );
    res.json({ ok: true, favorite: false });
  } catch (err) {
    console.error('Remove favorite error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to remove favorite' } });
  }
});

/* ──────────────────────────────  DAILY TRACKER  ───────────────────────────── */

const DEFAULT_TARGETS = { hydration: 8, walk: 1, meal: 3 };

router.get('/patients/:patientId/daily', requirePatientAccess, async (req, res) => {
  try {
    const pid = req.params.patientId;
    const date = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '')
      ? req.query.date
      : localDate(Date.now());

    const [logRes, medRes] = await Promise.all([
      query(`SELECT item_key, value, target FROM patient_daily_log WHERE patient_id = $1 AND log_date = $2`,
        [pid, date]),
      query(`SELECT id, medicine_name, title, dosage FROM reminders
              WHERE patient_id = $1 AND type = 'medicine' AND is_active = true ORDER BY created_at`,
        [pid]),
    ]);
    const log = Object.fromEntries(logRes.rows.map((r) => [r.item_key, r]));
    const item = (key) => ({
      value: log[key]?.value ?? 0,
      target: log[key]?.target ?? DEFAULT_TARGETS[key] ?? 0,
    });

    res.json({
      date,
      hydration: item('hydration'),
      walk: item('walk'),
      meals: item('meal'),
      medicines: medRes.rows.map((m) => ({
        reminderId: m.id,
        name: m.medicine_name || m.title,
        dosage: m.dosage || null,
        taken: (log[`med:${m.id}`]?.value ?? 0) > 0,
      })),
    });
  } catch (err) {
    console.error('Daily get error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to load daily tracker' } });
  }
});

router.post('/patients/:patientId/daily', requirePatientAccess, async (req, res) => {
  try {
    const pid = req.params.patientId;
    const { item_key, delta, value, target } = req.body || {};
    if (!item_key || typeof item_key !== 'string' || item_key.length > 64) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'item_key required' } });
    }
    const date = /^\d{4}-\d{2}-\d{2}$/.test(req.body.date || '') ? req.body.date : localDate(Date.now());
    const defTarget = DEFAULT_TARGETS[item_key] ?? 0;

    let row;
    if (typeof value === 'number') {
      const v = Math.max(0, Math.round(value));
      row = await query(
        `INSERT INTO patient_daily_log (patient_id, log_date, item_key, value, target, updated_at)
         VALUES ($1,$2,$3,$4,COALESCE($5::int,$6),NOW())
         ON CONFLICT (patient_id, log_date, item_key)
         DO UPDATE SET value = $4, updated_at = NOW()
         RETURNING item_key, value, target`,
        [pid, date, item_key, v, target ?? null, defTarget]
      );
    } else {
      const d = Math.round(delta ?? 1);
      row = await query(
        `INSERT INTO patient_daily_log (patient_id, log_date, item_key, value, target, updated_at)
         VALUES ($1,$2,$3,GREATEST(0,$4),COALESCE($5::int,$6),NOW())
         ON CONFLICT (patient_id, log_date, item_key)
         DO UPDATE SET value = GREATEST(0, patient_daily_log.value + $4), updated_at = NOW()
         RETURNING item_key, value, target`,
        [pid, date, item_key, d, target ?? null, defTarget]
      );
    }
    res.json(row.rows[0]);
  } catch (err) {
    console.error('Daily post error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to update daily tracker' } });
  }
});

router.post('/patients/:patientId/daily/target', requirePatientAccess, async (req, res) => {
  try {
    const pid = req.params.patientId;
    const { item_key, target } = req.body || {};
    if (!item_key || typeof target !== 'number') {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'item_key and target required' } });
    }
    const date = localDate(Date.now());
    const row = await query(
      `INSERT INTO patient_daily_log (patient_id, log_date, item_key, value, target, updated_at)
       VALUES ($1,$2,$3,0,$4,NOW())
       ON CONFLICT (patient_id, log_date, item_key)
       DO UPDATE SET target = $4, updated_at = NOW()
       RETURNING item_key, value, target`,
      [pid, date, item_key, Math.max(1, Math.round(target))]
    );
    res.json(row.rows[0]);
  } catch (err) {
    console.error('Daily target error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to set target' } });
  }
});

/* ────────────────────────────────  HISTORY  ───────────────────────────────── */

// Which stored metric is a game's headline result, and whether lower is better.
const HEADLINE = {
  'chimp-test': { metric: 'span', lowerBetter: false },
  'number-memory': { metric: 'span', lowerBetter: false },
  'sequence-memory': { metric: 'span', lowerBetter: false },
  'reaction-time': { metric: 'latency', lowerBetter: true },
  'find-object': { metric: 'latency', lowerBetter: true },
  'memory-match': { metric: 'accuracy', lowerBetter: false },
  'odd-one-out': { metric: 'accuracy', lowerBetter: false },
  'pattern-complete': { metric: 'accuracy', lowerBetter: false },
  'word-recall': { metric: 'accuracy', lowerBetter: false },
  'daily-routine': { metric: 'accuracy', lowerBetter: false },
  'story-sequencing': { metric: 'accuracy', lowerBetter: false },
  'sound-recognition': { metric: 'accuracy', lowerBetter: false },
};

function metricValue(metric, row) {
  if (metric === 'span') return row.max_span != null ? Number(row.max_span) : null;
  if (metric === 'latency') return row.median_latency_ms != null ? Number(row.median_latency_ms) : null;
  if (metric === 'accuracy') return row.accuracy != null ? Number(row.accuracy) : null;
  return null;
}

router.get('/patients/:patientId/history', requirePatientAccess, async (req, res) => {
  try {
    const pid = req.params.patientId;
    const [sessRes, gamesRes] = await Promise.all([
      query(
        `SELECT game_id, level, difficulty, duration_ms, trials_total, trials_correct,
                accuracy, median_latency_ms, max_span, raw_score, performance,
                completed, abandoned, ended_by_fatigue, client_created_at
           FROM game_sessions
          WHERE patient_id = $1
          ORDER BY client_created_at ASC`,
        [pid]
      ),
      query(`SELECT slug, title, icon_key FROM games WHERE is_active = true`, []),
    ]);
    const meta = Object.fromEntries(gamesRes.rows.map((g) => [g.slug, g]));

    const byGame = {};
    let totalPlays = 0;
    let totalMs = 0;
    for (const s of sessRes.rows) {
      if (s.abandoned) continue;
      totalPlays += 1;
      totalMs += Number(s.duration_ms) || 0;
      const head = HEADLINE[s.game_id];
      if (!head) continue;
      const g = (byGame[s.game_id] = byGame[s.game_id] || {
        slug: s.game_id,
        title: meta[s.game_id]?.title || s.game_id,
        icon: meta[s.game_id]?.icon_key || null,
        metric: head.metric,
        lowerBetter: head.lowerBetter,
        plays: 0,
        series: [],
      });
      g.plays += 1;
      g.series.push({
        t: s.client_created_at,
        value: metricValue(head.metric, s),
        span: s.max_span != null ? Number(s.max_span) : null,
        accuracy: s.accuracy != null ? Number(s.accuracy) : null,
        latency: s.median_latency_ms != null ? Number(s.median_latency_ms) : null,
        durationMs: Number(s.duration_ms) || null,
        trialsTotal: Number(s.trials_total) || 0,
        trialsCorrect: Number(s.trials_correct) || 0,
      });
    }

    const games = Object.values(byGame).map((g) => {
      const vals = g.series.map((p) => p.value).filter((v) => v != null);
      const sorted = [...vals].sort((a, b) => a - b);
      const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
      const best = vals.length ? (g.lowerBetter ? Math.min(...vals) : Math.max(...vals)) : null;
      const latest = g.series.length ? g.series[g.series.length - 1].value : null;
      return {
        ...g,
        best,
        median,
        latest,
        first: g.series[0]?.t || null,
        last: g.series[g.series.length - 1]?.t || null,
      };
    });

    res.json({ games, totalPlays, totalMinutes: Math.round(totalMs / 60000) });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to load history' } });
  }
});

export default router;
