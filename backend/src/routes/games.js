import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { requirePatientAccess } from '../middleware/patientAccess.js';

const router = Router();
router.use(authenticate);

router.get('/games', async (_req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM games WHERE is_active = true ORDER BY sort_order`);
    res.json(rows);
  } catch (err) {
    console.error('List games error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to list games' } });
  }
});

router.get('/patients/:patientId/game-state', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT g.slug, g.title, g.description, g.domains, g.level_count, g.requires_vault,
              g.supports_voice, g.icon_key,
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
    res.json(rows);
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
