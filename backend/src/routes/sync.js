import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query, transaction } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { requirePatientAccess } from '../middleware/patientAccess.js';
import rateLimit from 'express-rate-limit';
import config from '../config.js';

const router = Router();
router.use(authenticate);
const syncLimiter = rateLimit({ windowMs: config.rateLimits.sync.windowMs, max: config.rateLimits.sync.max, standardHeaders: true, legacyHeaders: false });

router.post('/sync', syncLimiter, requirePatientAccess, async (req, res) => {
  try {
    const { clientBatchId, deviceId, patientId, items } = req.body;
    if (!clientBatchId || !items || !Array.isArray(items)) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'clientBatchId and items array required' } });
    }
    const existing = await query(`SELECT id FROM sync_batches WHERE client_batch_id = $1 AND patient_id = $2`, [clientBatchId, patientId]);
    if (existing.rows.length) {
      return res.json({ applied: 0, skipped: items.length, duplicate: true });
    }
    let applied = 0, skipped = 0;
    for (const item of items) {
      try {
        switch (item.type) {
          case 'game_session': {
            const r = await query(
              `INSERT INTO game_sessions (id, patient_id, game_id, device_id, level, difficulty,
                started_at, ended_at, duration_ms, trials_total, trials_correct, accuracy,
                median_latency_ms, max_span, raw_score, performance, trials,
                completed, abandoned, ended_by_fatigue, played_offline, client_created_at, synced_at)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,NOW())
               ON CONFLICT (id) DO NOTHING`,
              [item.id, patientId, item.game_id, deviceId, item.level, item.difficulty,
               item.started_at, item.ended_at, item.duration_ms, item.trials_total,
               item.trials_correct, item.accuracy, item.median_latency_ms, item.max_span,
               item.raw_score, item.performance, item.trials ? JSON.stringify(item.trials) : null,
               item.completed, item.abandoned, item.ended_by_fatigue, item.played_offline, item.client_created_at]
            );
            r.rowCount ? applied++ : skipped++;
            break;
          }
          case 'reminder_ack': {
            const r = await query(
              `UPDATE reminder_occurrences SET status = 'acknowledged', acknowledged_at = COALESCE($1, NOW()),
                acknowledged_by = $2, synced_at = NOW()
               WHERE id = $3 AND (status = 'missed' OR status IS NULL)`,
              [item.acknowledged_at, item.acknowledged_by || 'patient', item.occurrence_id]
            );
            r.rowCount ? applied++ : skipped++;
            break;
          }
          case 'assessment': {
            const r = await query(
              `INSERT INTO assessments (id, patient_id, kind, instrument_version, locale, administered_by,
                started_at, completed_at, total_score, max_score, domain_scores, responses, notes)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
               ON CONFLICT (id) DO NOTHING`,
              [item.id, patientId, item.kind, item.instrument_version, item.locale,
               req.user.id, item.started_at, item.completed_at, item.total_score,
               item.max_score, JSON.stringify(item.domain_scores), JSON.stringify(item.responses), item.notes]
            );
            r.rowCount ? applied++ : skipped++;
            break;
          }
          default:
            skipped++;
        }
      } catch (e) {
        skipped++;
      }
    }
    await query(
      `INSERT INTO sync_batches (client_batch_id, patient_id, user_id, device_id, item_count, applied_count, skipped_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [clientBatchId, patientId, req.user.id, deviceId, items.length, applied, skipped]
    );
    res.json({ applied, skipped, conflicts: [] });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Sync failed' } });
  }
});

router.get('/sync/bootstrap', requirePatientAccess, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const [patient, skillStates, occurrences, alerts] = await Promise.all([
      query(`SELECT * FROM patients WHERE id = $1`, [patientId]),
      query(`SELECT * FROM skill_state WHERE patient_id = $1`, [patientId]),
      query(`SELECT * FROM reminder_occurrences WHERE patient_id = $1 AND scheduled_at > NOW() - INTERVAL '1 day' AND scheduled_at < NOW() + INTERVAL '2 days'`, [patientId]),
      query(`SELECT * FROM alerts WHERE patient_id = $1 AND resolved_at IS NULL`, [patientId]),
    ]);
    res.json({
      patient: patient.rows[0] || null,
      skill_states: skillStates.rows,
      occurrences: occurrences.rows,
      alerts: alerts.rows,
    });
  } catch (err) {
    console.error('Bootstrap error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Bootstrap failed' } });
  }
});

export default router;
