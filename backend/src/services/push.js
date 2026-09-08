import webPush from 'web-push';
import config from '../config.js';
import { query } from '../db.js';

if (config.vapidPublicKey && config.vapidPrivateKey) {
  webPush.setVapidDetails(
    config.vapidSubject,
    config.vapidPublicKey,
    config.vapidPrivateKey
  );
}

export async function sendPushNotification(subscription, payload) {
  const result = await webPush.sendNotification(
    subscription,
    typeof payload === 'string' ? payload : JSON.stringify(payload)
  );
  return result;
}

export async function notifyUser(userId, payload) {
  const { rows: subs } = await query(
    `SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1 AND failed_at IS NULL`,
    [userId]
  );

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await sendPushNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        return { id: sub.id, ok: true };
      } catch (err) {
        const status = err.statusCode || err.status;
        if (status === 404 || status === 410) {
          await query(`UPDATE push_subscriptions SET failed_at = NOW() WHERE id = $1`, [sub.id]);
          console.log(`Marked stale subscription ${sub.id} as failed`);
        }
        return { id: sub.id, ok: false, error: err.message };
      }
    })
  );

  const sent = results.filter(r => r.status === 'fulfilled' && r.value?.ok).length;
  const failed = results.length - sent;
  return { total: subs.length, sent, failed };
}

export async function notifyPatient(patientId, payload) {
  const { rows: subs } = await query(
    `SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE patient_id = $1 AND failed_at IS NULL`,
    [patientId]
  );

  if (subs.length === 0) return { total: 0, sent: 0, failed: 0 };

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await sendPushNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        return { id: sub.id, ok: true };
      } catch (err) {
        const status = err.statusCode || err.status;
        if (status === 404 || status === 410) {
          await query(`UPDATE push_subscriptions SET failed_at = NOW() WHERE id = $1`, [sub.id]);
        }
        return { id: sub.id, ok: false, error: err.message };
      }
    })
  );

  const sent = results.filter(r => r.status === 'fulfilled' && r.value?.ok).length;
  return { total: subs.length, sent, failed: results.length - sent };
}
