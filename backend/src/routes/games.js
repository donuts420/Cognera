import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { requirePatientAccess } from '../middleware/patientAccess.js';
import { computePerformance, updateTheta, selectLevel } from '../../../shared/engine/index.js';

const router = Router();
router.use(authenticate);

// node-postgres returns `cognitive_domain[]` (a custom enum array) as a raw
// string like "{memory,visuospatial}". Normalise to a real array for the API.
function coerceDomains(row) {
  if (row && typeof row.domains === 'string') {
    row.domains = row.domains.replace(/^\{|\}$/g, '').split(',')
      .map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
  }
  return row;
}

// Re-run the adaptive engine over a completed session and project the result
// into skill_state. skill_state is a derived projection of the append-only
// game_sessions log (DOCUMENTATION.md section 8), so this is safe to re-run.
async function projectSkillState(patientId, gameId, session) {
  try {
    const gameRes = await query(`SELECT config FROM games WHERE slug = $1`, [gameId]);
    if (!gameRes.rows.length) return;
    const levels = gameRes.rows[0].config?.levels || [];

    const stateRes = await query(
      `SELECT * FROM skill_state WHERE patient_id = $1 AND game_id = $2`,
      [patientId, gameId]
    );
    const prev = stateRes.rows[0] || {
      theta: 50, uncertainty: 1.0, current_level: 1,
      consecutive_above: 0, consecutive_below: 0, sessions_played: 0,
      baseline_latency_ms: null,
    };

    const trials = Array.isArray(session.trials) ? session.trials : [];
    const baseline = prev.baseline_latency_ms || session.median_latency_ms || 2500;
    const performance =
      session.performance != null ? Number(session.performance) : computePerformance(trials, baseline);
    const difficulty = session.difficulty != null ? Number(session.difficulty)
      : (levels[session.level]?.difficulty ?? 50);

    // Bad-day sessions are stored but excluded from the ability estimate.
    const isOutlier = false;
    let theta = Number(prev.theta);
    let uncertainty = Number(prev.uncertainty);
    if (!session.abandoned && !isOutlier) {
      const updated = updateTheta(theta, uncertainty, difficulty, performance);
      theta = updated.theta;
      uncertainty = updated.uncertainty;
    }

    const aboveTarget = performance >= 0.85;
    const consecutiveAbove = aboveTarget ? Number(prev.consecutive_above) + 1 : 0;
    const consecutiveBelow = !aboveTarget ? Number(prev.consecutive_below) + 1 : 0;

    const { level } = selectLevel(theta, levels, consecutiveAbove, consecutiveBelow);
    const newBaseline = session.median_latency_ms
      ? Math.round(baseline * 0.7 + session.median_latency_ms * 0.3)
      : prev.baseline_latency_ms;

    await query(
      `INSERT INTO skill_state (patient_id, game_id, theta, uncertainty, current_level,
        consecutive_above, consecutive_below, sessions_played, baseline_latency_ms, last_played_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())
       ON CONFLICT (patient_id, game_id) DO UPDATE SET
        theta = EXCLUDED.theta, uncertainty = EXCLUDED.uncertainty, current_level = EXCLUDED.current_level,
        consecutive_above = EXCLUDED.consecutive_above, consecutive_below = EXCLUDED.consecutive_below,
        sessions_played = skill_state.sessions_played + 1,
        baseline_latency_ms = EXCLUDED.baseline_latency_ms, last_played_at = NOW(), updated_at = NOW()`,
      [patientId, gameId, theta, uncertainty, level + 1,
       consecutiveAbove, consecutiveBelow, Number(prev.sessions_played) + 1, newBaseline]
    );
  } catch (err) {
    console.error('projectSkillState error:', err);
  }
}

router.get('/games', async (_req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM games WHERE is_active = true ORDER BY sort_order`);
    res.json(rows.map(coerceDomains));
  } catch (err) {
    console.error('List games error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to list games' } });
  }
});

router.get('/patients/:patientId/game-state', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT g.slug, g.title, g.description, g.domains, g.level_count, g.requires_vault,
              g.supports_voice, g.icon_key, g.config,
              COALESCE(ss.theta, 50) as theta,
              COALESCE(ss.current_level, 1) as current_level,
              COALESCE(ss.sessions_played, 0) as sessions_played,
              ss.last_played_at
       FROM games g
       LEFT JOIN skill_state ss ON ss.game_id = g.slug AND ss.patient_id = $1
       WHERE g.is_active = true
       ORDER BY g.sort_order`,
      [req.params.patientId]
    );
    res.json(rows.map(coerceDomains));
  } catch (err) {
    console.error('Get game state error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to get game state' } });
  }
});

router.post('/patients/:patientId/sessions', requirePatientAccess, async (req, res) => {
  try {
    const { id, game_id, device_id, level, difficulty, started_at, ended_at, duration_ms,
            trials_total, trials_correct, accuracy, median_latency_ms, max_span,
            raw_score, performance, trials, completed, abandoned, ended_by_fatigue, played_offline } = req.body;
    if (!id || !game_id) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'id and game_id required' } });
    }
    const sessionId = id || uuid();
    const { rows } = await query(
      `INSERT INTO game_sessions (id, patient_id, game_id, device_id, level, difficulty,
        started_at, ended_at, duration_ms, trials_total, trials_correct, accuracy,
        median_latency_ms, max_span, raw_score, performance, trials,
        completed, abandoned, ended_by_fatigue, played_offline, client_created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,NOW())
       ON CONFLICT (id) DO NOTHING
       RETURNING *`,
      [sessionId, req.params.patientId, game_id, device_id || null, level || null,
       difficulty || null, started_at || null, ended_at || null, duration_ms || null,
       trials_total || 0, trials_correct || 0, accuracy || null,
       median_latency_ms || null, max_span || null, raw_score || null,
       performance || null, trials ? JSON.stringify(trials) : null,
       completed !== false, abandoned || false, ended_by_fatigue || false,
       played_offline || false]
    );
    if (!rows.length) {
      return res.json({ id: sessionId, skipped: true });
    }
    if (rows[0].completed && !rows[0].abandoned) {
      await projectSkillState(req.params.patientId, game_id, {
        ...rows[0],
        trials: trials || [],
        level: level ?? rows[0].level,
      });
    }
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to create session' } });
  }
});

router.get('/patients/:patientId/sessions', requirePatientAccess, async (req, res) => {
  try {
    const { game_id, limit = 50, offset = 0 } = req.query;
    let sql = `SELECT * FROM game_sessions WHERE patient_id = $1`;
    const params = [req.params.patientId];
    if (game_id) { sql += ` AND game_id = $${params.length + 1}`; params.push(game_id); }
    sql += ` ORDER BY client_created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to list sessions' } });
  }
});

router.get('/sessions/:id', async (req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM game_sessions WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: { code: 'not_found', message: 'Session not found' } });
    res.json(rows[0]);
  } catch (err) {
    console.error('Get session error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to get session' } });
  }
});

export default router;
