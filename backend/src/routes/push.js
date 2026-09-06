import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import config from '../config.js';

const router = Router();

router.get('/push/vapid-key', (_req, res) => {
  res.json({ publicKey: config.vapidPublicKey });
});

router.post('/push/subscribe', authenticate, async (req, res) => {
  try {
    const { endpoint, p256dh, auth, patientId } = req.body;
    if (!endpoint || !p256dh || !auth) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'Push subscription fields required' } });
    }
    const { rows } = await query(
      `INSERT INTO push_subscriptions (user_id, patient_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (endpoint) DO UPDATE SET p256dh = $4, auth = $5, failed_at = NULL
       RETURNING id`,
      [req.user.id, patientId || null, endpoint, p256dh, auth]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to subscribe' } });
  }
});

router.delete('/push/subscribe', authenticate, async (req, res) => {
  try {
    const { endpoint } = req.body;
    await query(`DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2`, [endpoint, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to unsubscribe' } });
  }
});

export default router;
