import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { requirePatientAccess } from '../middleware/patientAccess.js';
import config from '../config.js';

const router = Router();
router.use(authenticate);

router.get('/vault/:patientId', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM memory_vault WHERE patient_id = $1 ORDER BY kind, display_name`,
      [req.params.patientId]
    );
    res.json(rows);
  } catch (err) {
    console.error('List vault error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to list vault' } });
  }
});

router.post('/media/upload-url', requirePatientAccess, async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'filename and contentType required' } });
    }
    const key = `media/${req.params.patientId || req.user.id}/${Date.now()}-${filename}`;
    res.json({ key, putUrl: `${config.r2Endpoint}/${config.r2Bucket}/${key}` });
  } catch (err) {
    console.error('Upload URL error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to generate upload URL' } });
  }
});

router.post('/media/sign', requirePatientAccess, async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'key required' } });
    }
    res.json({ url: `${config.r2Endpoint}/${config.r2Bucket}/${key}`, expiresIn: 300 });
  } catch (err) {
    console.error('Sign URL error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to sign URL' } });
  }
});

export default router;
