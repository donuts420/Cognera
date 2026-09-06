import { query } from '../db.js';

export async function requirePatientAccess(req, res, next) {
  const patientId = req.params.patientId || req.params.id;
  if (!patientId) {
    return res.status(400).json({ error: { code: 'validation_failed', message: 'Patient ID required' } });
  }

  const { rows } = await query(
    `SELECT can_edit_care_plan, revoked_at
     FROM care_relationships
     WHERE user_id = $1 AND patient_id = $2`,
    [req.user.id, patientId]
  );

  if (!rows.length || rows[0].revoked_at) {
    return res.status(403).json({ error: { code: 'no_care_relationship', message: 'No active care relationship' } });
  }

  req.careRelationship = rows[0];
  next();
}

export function requireEditPermission(req, res, next) {
  if (!req.careRelationship?.can_edit_care_plan) {
    return res.status(403).json({ error: { code: 'insufficient_permission', message: 'Edit permission required' } });
  }
  next();
}
