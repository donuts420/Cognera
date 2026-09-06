import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { requirePatientAccess } from '../middleware/patientAccess.js';

const router = Router();
router.use(authenticate);

router.get('/patients/:patientId/analytics/overview', requirePatientAccess, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const [snapshots, sessions, assessments] = await Promise.all([
      query(`SELECT * FROM cognitive_snapshots WHERE patient_id = $1 ORDER BY snapshot_date DESC LIMIT 90`, [patientId]),
      query(`SELECT COUNT(*) as total_sessions, SUM(duration_ms) as total_ms FROM game_sessions WHERE patient_id = $1`, [patientId]),
      query(`SELECT * FROM assessments WHERE patient_id = $1 ORDER BY started_at DESC LIMIT 5`, [patientId]),
    ]);
    const latest = snapshots.rows[0] || null;
    res.json({
      cwi: latest?.cwi || null,
      trend_direction: latest?.trend_direction || 'insufficient_data',
      total_sessions: parseInt(sessions.rows[0]?.total_sessions || 0),
      total_minutes: Math.round((sessions.rows[0]?.total_ms || 0) / 60000),
      recent_assessments: assessments.rows,
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to load overview' } });
  }
});

router.get('/patients/:patientId/analytics/trend', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM cognitive_snapshots WHERE patient_id = $1 ORDER BY snapshot_date`,
      [req.params.patientId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Trend error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to load trend' } });
  }
});

router.get('/patients/:patientId/analytics/domains', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT domain_indices FROM cognitive_snapshots WHERE patient_id = $1 ORDER BY snapshot_date DESC LIMIT 1`,
      [req.params.patientId]
    );
    res.json(rows[0]?.domain_indices || {});
  } catch (err) {
    console.error('Domains error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to load domains' } });
  }
});

router.get('/patients/:patientId/analytics/adherence', requirePatientAccess, async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const [total, acknowledged] = await Promise.all([
      query(`SELECT type, COUNT(*) as total FROM reminder_occurrences WHERE patient_id = $1 AND scheduled_at > NOW() - INTERVAL '30 days' GROUP BY type`, [patientId]),
      query(`SELECT type, COUNT(*) as ack FROM reminder_occurrences WHERE patient_id = $1 AND scheduled_at > NOW() - INTERVAL '30 days' AND status = 'acknowledged' GROUP BY type`, [patientId]),
    ]);
    const ackMap = {};
    acknowledged.rows.forEach((r) => { ackMap[r.type] = parseInt(r.ack); });
    const adherence = total.rows.map((r) => ({
      type: r.type,
      total: parseInt(r.total),
      acknowledged: ackMap[r.type] || 0,
      rate: r.total > 0 ? ((ackMap[r.type] || 0) / parseInt(r.total) * 100).toFixed(1) : '0.0',
    }));
    res.json(adherence);
  } catch (err) {
    console.error('Adherence error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to load adherence' } });
  }
});

router.get('/caseload/summary', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.id, p.display_name, p.village, p.district,
              cs.cwi, cs.trend_direction, cs.trend_slope,
              (SELECT COUNT(*) FROM game_sessions gs WHERE gs.patient_id = p.id AND gs.client_created_at > NOW() - INTERVAL '30 days') as sessions_30d,
              (SELECT COUNT(*) FROM reminder_occurrences ro WHERE ro.patient_id = p.id AND ro.scheduled_at > NOW() - INTERVAL '30 days' AND ro.status = 'acknowledged') as ack_30d,
              (SELECT COUNT(*) FROM reminder_occurrences ro WHERE ro.patient_id = p.id AND ro.scheduled_at > NOW() - INTERVAL '30 days') as total_rem_30d,
              (SELECT COUNT(*) FROM alerts a WHERE a.patient_id = p.id AND a.resolved_at IS NULL) as open_alerts
       FROM patients p
       JOIN care_relationships cr ON cr.patient_id = p.id AND cr.revoked_at IS NULL AND cr.user_id = $1
       LEFT JOIN LATERAL (SELECT cwi, trend_direction, trend_slope FROM cognitive_snapshots WHERE patient_id = p.id ORDER BY snapshot_date DESC LIMIT 1) cs ON true
       ORDER BY p.display_name`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Caseload error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to load caseload' } });
  }
});

export default router;
