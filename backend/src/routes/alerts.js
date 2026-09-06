import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { requirePatientAccess } from '../middleware/patientAccess.js';

const router = Router();
router.use(authenticate);

router.get('/patients/:patientId/alerts', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM alerts WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.params.patientId]
    );
    res.json(rows);
  } catch (err) {
    console.error('List alerts error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to list alerts' } });
  }
});

router.get('/alerts/feed', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT a.*, p.display_name as patient_name
       FROM alerts a
       JOIN patients p ON p.id = a.patient_id
       JOIN care_relationships cr ON cr.patient_id = a.patient_id AND cr.user_id = $1 AND cr.revoked_at IS NULL
       ORDER BY a.created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Alert feed error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to load alert feed' } });
  }
});

router.post('/alerts/:id/ack', async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE alerts SET acknowledged_at = NOW(), acknowledged_by = $1 WHERE id = $2 AND acknowledged_at IS NULL RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: { code: 'not_found', message: 'Alert not found' } });
    res.json(rows[0]);
  } catch (err) {
    console.error('Ack alert error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to acknowledge alert' } });
  }
});

router.post('/alerts/:id/resolve', async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE alerts SET resolved_at = NOW() WHERE id = $2 AND resolved_at IS NULL RETURNING *`,
      [req.user.id, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: { code: 'not_found', message: 'Alert not found' } });
    res.json(rows[0]);
  } catch (err) {
    console.error('Resolve alert error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to resolve alert' } });
  }
});

export default router;
