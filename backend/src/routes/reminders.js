import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { requirePatientAccess, requireEditPermission } from '../middleware/patientAccess.js';

const router = Router();
router.use(authenticate);

router.get('/patients/:patientId/reminders', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM reminders WHERE patient_id = $1 AND is_active = true ORDER BY type, created_at`,
      [req.params.patientId]
    );
    res.json(rows);
  } catch (err) {
    console.error('List reminders error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to list reminders' } });
  }
});

router.post('/patients/:patientId/reminders', requirePatientAccess, requireEditPermission, async (req, res) => {
  try {
    const id = uuid();
    const { type, title, description, medicine_name, dosage, photo_key, times_of_day,
            days_of_week, one_off_at, start_date, end_date, escalate_after_minutes,
            max_snoozes, snooze_minutes, voice_prompt_key } = req.body;
    if (!type || !title) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'type and title required' } });
    }
    const { rows } = await query(
      `INSERT INTO reminders (id, patient_id, type, title, description, medicine_name, dosage,
        photo_key, times_of_day, days_of_week, one_off_at, start_date, end_date,
        escalate_after_minutes, max_snoozes, snooze_minutes, voice_prompt_key, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [id, req.params.patientId, type, title, description || null, medicine_name || null,
       dosage || null, photo_key || null, times_of_day || null, days_of_week || null,
       one_off_at || null, start_date || null, end_date || null,
       escalate_after_minutes || 30, max_snoozes || 3, snooze_minutes || 10,
       voice_prompt_key || null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to create reminder' } });
  }
});

router.patch('/reminders/:id', requirePatientAccess, requireEditPermission, async (req, res) => {
  try {
    const { title, description, medicine_name, dosage, photo_key, times_of_day,
            days_of_week, is_active } = req.body;
    const { rows } = await query(
      `UPDATE reminders SET title = COALESCE($1, title), description = COALESCE($2, description),
        medicine_name = COALESCE($3, medicine_name), dosage = COALESCE($4, dosage),
        photo_key = COALESCE($5, photo_key), times_of_day = COALESCE($6, times_of_day),
        days_of_week = COALESCE($7, days_of_week), is_active = COALESCE($8, is_active),
        updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [title, description, medicine_name, dosage, photo_key, times_of_day, days_of_week, is_active, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: { code: 'not_found', message: 'Reminder not found' } });
    res.json(rows[0]);
  } catch (err) {
    console.error('Update reminder error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to update reminder' } });
  }
});

router.delete('/reminders/:id', requirePatientAccess, requireEditPermission, async (req, res) => {
  try {
    await query(`UPDATE reminders SET is_active = false, updated_at = NOW() WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete reminder error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to delete reminder' } });
  }
});

router.get('/patients/:patientId/occurrences', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT ro.*, r.type, r.title, r.medicine_name, r.photo_key
       FROM reminder_occurrences ro
       JOIN reminders r ON r.id = ro.reminder_id
       WHERE ro.patient_id = $1
       ORDER BY ro.scheduled_at DESC
       LIMIT 100`,
      [req.params.patientId]
    );
    res.json(rows);
  } catch (err) {
    console.error('List occurrences error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to list occurrences' } });
  }
});

router.post('/occurrences/:id/ack', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE reminder_occurrences SET status = 'acknowledged', acknowledged_at = NOW(),
        acknowledged_by = COALESCE($1, 'patient')
       WHERE id = $2 AND status IN ('pending', 'snoozed')
       RETURNING *`,
      [req.body.acknowledged_by || 'patient', req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: { code: 'not_found', message: 'Occurrence not found or already resolved' } });
    res.json(rows[0]);
  } catch (err) {
    console.error('Ack occurrence error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to acknowledge' } });
  }
});

router.post('/occurrences/:id/snooze', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE reminder_occurrences SET status = 'snoozed', snooze_count = snooze_count + 1,
        snoozed_until = NOW() + INTERVAL '10 minutes'
       WHERE id = $1 AND status IN ('pending', 'snoozed') AND snooze_count < 3
       RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: { code: 'not_found', message: 'Cannot snooze' } });
    res.json(rows[0]);
  } catch (err) {
    console.error('Snooze error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to snooze' } });
  }
});

router.post('/occurrences/:id/skip', requirePatientAccess, async (req, res) => {
  try {
    const { rows } = await query(
      `UPDATE reminder_occurrences SET status = 'skipped'
       WHERE id = $1 AND status IN ('pending', 'snoozed') RETURNING *`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: { code: 'not_found', message: 'Occurrence not found' } });
    res.json(rows[0]);
  } catch (err) {
    console.error('Skip error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to skip' } });
  }
});

export default router;
