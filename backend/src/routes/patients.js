import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import { query, transaction } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { requirePatientAccess, requireEditPermission } from '../middleware/patientAccess.js';
import { auditLog } from '../middleware/audit.js';
import config from '../config.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.id, p.display_name, p.photo_key, p.birth_year, p.sex, p.preferred_locale,
              p.village, p.block, p.district, p.state, p.dementia_stage, p.is_active,
              p.onboarded_at, p.created_at,
              cr.relationship, cr.can_edit_care_plan
       FROM patients p
       JOIN care_relationships cr ON cr.patient_id = p.id AND cr.revoked_at IS NULL
       WHERE cr.user_id = $1
       ORDER BY p.display_name`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('List patients error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to list patients' } });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = uuid();
    const { display_name, photo_key, birth_year, sex, preferred_locale, village, block, district, state, dementia_stage, diagnosis_notes, abha_number } = req.body;
    if (!display_name) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'display_name required', details: [{ field: 'display_name', message: 'Required' }] } });
    }
    const { rows } = await query(
      `INSERT INTO patients (id, display_name, photo_key, birth_year, sex, preferred_locale, village, block, district, state, dementia_stage, diagnosis_notes, abha_number, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [id, display_name, photo_key || null, birth_year || null, sex || null, preferred_locale || 'en', village || null, block || null, district || null, state || null, dementia_stage || 'unknown', diagnosis_notes || null, abha_number || null, req.user.id]
    );
    await query(
      `INSERT INTO care_relationships (user_id, patient_id, relationship, can_edit_care_plan, granted_by)
       VALUES ($1, $2, 'primary_caregiver', true, $1)`,
      [req.user.id, id]
    );
    await auditLog('create', 'patient')(req, res, () => {});
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create patient error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to create patient' } });
  }
});

router.get('/:id', requirePatientAccess, auditLog('view', 'patient'), async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT p.*,
              (SELECT json_agg(json_build_object(
                'user_id', cr2.user_id,
                'relationship', cr2.relationship,
                'can_edit_care_plan', cr2.can_edit_care_plan,
                'full_name', u2.full_name,
                'revoked_at', cr2.revoked_at
              )) FROM care_relationships cr2 JOIN users u2 ON u2.id = cr2.user_id WHERE cr2.patient_id = p.id) AS care_team,
              (SELECT json_agg(json_build_object(
                'consent_type', c.consent_type,
                'policy_version', c.policy_version,
                'granted_at', c.granted_at,
                'is_guardian_consent', c.is_guardian_consent
              )) FROM consents c WHERE c.patient_id = p.id AND c.revoked_at IS NULL) AS consents,
              (SELECT json_agg(json_build_object(
                'kind', a.kind,
                'severity', a.severity,
                'title', a.title,
                'body', a.body,
                'created_at', a.created_at,
                'acknowledged_at', a.acknowledged_at,
                'resolved_at', a.resolved_at
              ) ORDER BY a.created_at DESC) FROM alerts a WHERE a.patient_id = p.id AND a.resolved_at IS NULL) AS active_alerts
       FROM patients p WHERE p.id = $1`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: { code: 'not_found', message: 'Patient not found' } });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get patient error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to get patient' } });
  }
});

router.patch('/:id', requirePatientAccess, requireEditPermission, auditLog('update', 'patient'), async (req, res) => {
  try {
    const { display_name, photo_key, birth_year, sex, preferred_locale, village, block, district, state, dementia_stage, diagnosis_notes, abha_number } = req.body;
    const { rows } = await query(
      `UPDATE patients SET
        display_name = COALESCE($1, display_name), photo_key = COALESCE($2, photo_key),
        birth_year = COALESCE($3, birth_year), sex = COALESCE($4, sex),
        preferred_locale = COALESCE($5, preferred_locale), village = COALESCE($6, village),
        block = COALESCE($7, block), district = COALESCE($8, district),
        state = COALESCE($9, state), dementia_stage = COALESCE($10, dementia_stage),
        diagnosis_notes = COALESCE($11, diagnosis_notes), abha_number = COALESCE($12, abha_number),
        updated_at = NOW()
       WHERE id = $13 RETURNING *`,
      [display_name, photo_key, birth_year, sex, preferred_locale, village, block, district, state, dementia_stage, diagnosis_notes, abha_number, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Update patient error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to update patient' } });
  }
});

router.delete('/:id', requirePatientAccess, requireEditPermission, auditLog('delete', 'patient'), async (req, res) => {
  try {
    await query(`UPDATE patients SET is_active = false, updated_at = NOW() WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete patient error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to delete patient' } });
  }
});

router.get('/:id/export', requirePatientAccess, auditLog('export', 'patient'), async (req, res) => {
  try {
    const { rows: patientRows } = await query(`SELECT * FROM patients WHERE id = $1`, [req.params.id]);
    if (!patientRows.length) return res.status(404).json({ error: { code: 'not_found', message: 'Patient not found' } });
    const patient = patientRows[0];
    const [sessions, assessments, reminders, snapshots] = await Promise.all([
      query(`SELECT * FROM game_sessions WHERE patient_id = $1 ORDER BY created_at`, [req.params.id]),
      query(`SELECT * FROM assessments WHERE patient_id = $1 ORDER BY started_at`, [req.params.id]),
      query(`SELECT * FROM reminders WHERE patient_id = $1`, [req.params.id]),
      query(`SELECT * FROM cognitive_snapshots WHERE patient_id = $1 ORDER BY snapshot_date`, [req.params.id]),
    ]);
    res.json({
      patient,
      game_sessions: sessions.rows,
      assessments: assessments.rows,
      reminders: reminders.rows,
      cognitive_snapshots: snapshots.rows,
      exported_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Export patient error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Export failed' } });
  }
});

router.post('/:id/pin', requirePatientAccess, requireEditPermission, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || !/^\d{4}$/.test(pin)) {
      return res.status(422).json({ error: { code: 'validation_failed', message: '4-digit PIN required' } });
    }
    const hash = await bcrypt.hash(pin, 10);
    await query(`UPDATE patients SET exit_pin_hash = $1 WHERE id = $2`, [hash, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Set PIN error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to set PIN' } });
  }
});

router.post('/pin/verify', async (req, res) => {
  try {
    const { patientId, pin } = req.body;
    if (!patientId || !pin) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'patientId and pin required' } });
    }
    const { rows } = await query(`SELECT exit_pin_hash FROM patients WHERE id = $1`, [patientId]);
    if (!rows.length || !rows[0].exit_pin_hash) {
      return res.status(404).json({ error: { code: 'not_found', message: 'Patient not found or no PIN set' } });
    }
    const valid = await bcrypt.compare(pin, rows[0].exit_pin_hash);
    res.json({ valid });
  } catch (err) {
    console.error('Verify PIN error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'PIN verification failed' } });
  }
});

router.post('/:id/care-team', requirePatientAccess, requireEditPermission, auditLog('create', 'care_relationship'), async (req, res) => {
  try {
    const { user_id, relationship, can_edit_care_plan } = req.body;
    if (!user_id || !relationship) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'user_id and relationship required' } });
    }
    const { rows } = await query(
      `INSERT INTO care_relationships (user_id, patient_id, relationship, can_edit_care_plan, granted_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, patient_id) WHERE revoked_at IS NULL
       DO UPDATE SET relationship = $3, can_edit_care_plan = $4
       RETURNING *`,
      [user_id, req.params.id, relationship, can_edit_care_plan || false, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Add care team error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to add care team member' } });
  }
});

router.delete('/:id/care-team/:userId', requirePatientAccess, requireEditPermission, auditLog('delete', 'care_relationship'), async (req, res) => {
  try {
    await query(
      `UPDATE care_relationships SET revoked_at = NOW() WHERE user_id = $1 AND patient_id = $2 AND revoked_at IS NULL`,
      [req.params.userId, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Remove care team error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to remove care team member' } });
  }
});

router.post('/:id/consents', requirePatientAccess, requireEditPermission, auditLog('create', 'consent'), async (req, res) => {
  try {
    const { consent_type, policy_version, guardian_relation, is_guardian_consent, locale, evidence } = req.body;
    if (!consent_type || !policy_version) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'consent_type and policy_version required' } });
    }
    const { rows } = await query(
      `INSERT INTO consents (patient_id, consent_type, policy_version, granted_by_user_id, guardian_relation, is_guardian_consent, locale, evidence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.params.id, consent_type, policy_version, req.user.id, guardian_relation || null, is_guardian_consent || false, locale || 'en', evidence ? JSON.stringify(evidence) : null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Add consent error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to add consent' } });
  }
});

router.delete('/:id/consents/:consentId', requirePatientAccess, requireEditPermission, auditLog('delete', 'consent'), async (req, res) => {
  try {
    await query(`UPDATE consents SET revoked_at = NOW() WHERE id = $1 AND patient_id = $2`, [req.params.consentId, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Revoke consent error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to revoke consent' } });
  }
});

export default router;
