import { query } from '../db.js';

export function auditLog(action, entity) {
  return async (req, res, next) => {
    const originalSend = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const patientId = req.params.patientId || req.params.id || body?.id;
        query(
          `INSERT INTO audit_log (actor_user_id, patient_id, action, entity, entity_id, ip, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            req.user?.id,
            patientId,
            action,
            entity,
            req.params.id || null,
            req.ip,
            req.headers['user-agent'] || null,
          ]
        ).catch((err) => console.error('Audit log error:', err));
      }
      return originalSend(body);
    };
    next();
  };
}
