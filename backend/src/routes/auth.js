import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { query, transaction } from '../db.js';
import config from '../config.js';
import { authenticate } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const loginLimiter = rateLimit({ windowMs: config.rateLimits.login.windowMs, max: config.rateLimits.login.max, standardHeaders: true, legacyHeaders: false, message: { error: { code: 'rate_limited', message: 'Too many login attempts' } } });
const refreshLimiter = rateLimit({ windowMs: config.rateLimits.refresh.windowMs, max: config.rateLimits.refresh.max, standardHeaders: true, legacyHeaders: false, message: { error: { code: 'rate_limited', message: 'Too many refresh attempts' } } });

function signAccessToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

router.post('/register', loginLimiter, async (req, res) => {
  try {
    const { phone, email, password, full_name, role } = req.body;
    if (!password || (!phone && !email)) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'Phone or email and password required', details: [{ field: 'phone/email', message: 'At least one required' }] } });
    }
    const passwordHash = await bcrypt.hash(password, config.bcryptCost);
    const { rows } = await query(
      `INSERT INTO users (phone, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, phone, email, full_name, role, preferred_locale`,
      [phone || null, email || null, passwordHash, full_name || null, role || 'caregiver']
    );
    const user = rows[0];
    const accessToken = signAccessToken(user);
    const refreshToken = uuid();
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO sessions (user_id, refresh_token_hash, device_label, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshHash, req.body.device_label || 'web', req.headers['user-agent'] || null, expiresAt]
    );
    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'Account already exists' } });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Registration failed' } });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'Identifier and password required' } });
    }
    const { rows } = await query(
      `SELECT id, phone, email, password_hash, full_name, role, preferred_locale, is_active
       FROM users WHERE phone = $1 OR email = $1`,
      [identifier]
    );
    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Invalid credentials' } });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Invalid credentials' } });
    }
    await query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [user.id]);
    const accessToken = signAccessToken(user);
    const refreshToken = uuid();
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO sessions (user_id, refresh_token_hash, device_label, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshHash, req.body.device_label || 'web', req.headers['user-agent'] || null, expiresAt]
    );
    delete user.password_hash;
    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Login failed' } });
  }
});

router.post('/refresh', refreshLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'Refresh token required' } });
    }
    const { rows: sessions } = await query(
      `SELECT s.*, u.id as uid, u.phone, u.email, u.full_name, u.role, u.preferred_locale
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.expires_at > NOW() AND s.revoked_at IS NULL`
    );
    let matchedSession = null;
    for (const s of sessions) {
      if (await bcrypt.compare(refreshToken, s.refresh_token_hash)) {
        matchedSession = s;
        break;
      }
    }
    if (!matchedSession) {
      return res.status(401).json({ error: { code: 'token_reused', message: 'Invalid or revoked refresh token' } });
    }
    await query(`UPDATE sessions SET revoked_at = NOW() WHERE id = $1`, [matchedSession.id]);
    const user = { id: matchedSession.uid, phone: matchedSession.phone, email: matchedSession.email, full_name: matchedSession.full_name, role: matchedSession.role, preferred_locale: matchedSession.preferred_locale };
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = uuid();
    const refreshHash = await bcrypt.hash(newRefreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO sessions (user_id, refresh_token_hash, device_label, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [matchedSession.user_id, refreshHash, matchedSession.device_label, matchedSession.user_agent, expiresAt]
    );
    res.json({ user, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Refresh failed' } });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  try {
    await query(`UPDATE sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`, [req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Logout failed' } });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT u.id, u.phone, u.email, u.full_name, u.role, u.preferred_locale,
              json_agg(json_build_object(
                'patient_id', cr.patient_id,
                'relationship', cr.relationship,
                'can_edit_care_plan', cr.can_edit_care_plan,
                'display_name', p.display_name,
                'photo_key', p.photo_key
              )) FILTER (WHERE cr.patient_id IS NOT NULL) AS patients
       FROM users u
       LEFT JOIN care_relationships cr ON cr.user_id = u.id AND cr.revoked_at IS NULL
       LEFT JOIN patients p ON p.id = cr.patient_id
       WHERE u.id = $1 GROUP BY u.id`,
      [req.user.id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: { code: 'not_found', message: 'User not found' } });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Failed to load profile' } });
  }
});

router.patch('/me', authenticate, async (req, res) => {
  try {
    const { full_name, preferred_locale } = req.body;
    const { rows } = await query(
      `UPDATE users SET full_name = COALESCE($1, full_name), preferred_locale = COALESCE($2, preferred_locale)
       WHERE id = $3 RETURNING id, phone, email, full_name, role, preferred_locale`,
      [full_name || null, preferred_locale || null, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Update me error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Update failed' } });
  }
});

router.post('/dev', async (req, res) => {
  if (!config.allowDevLogin) {
    return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Dev login disabled' } });
  }
  try {
    const { rows } = await query(`SELECT id, phone, email, full_name, role, preferred_locale FROM users WHERE role = 'admin' LIMIT 1`);
    if (!rows.length) {
      return res.status(404).json({ error: { code: 'not_found', message: 'No admin user found' } });
    }
    const user = rows[0];
    const accessToken = signAccessToken(user);
    res.json({ user, accessToken });
  } catch (err) {
    console.error('Dev login error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Dev login failed' } });
  }
});

router.post('/google', loginLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(422).json({ error: { code: 'validation_failed', message: 'Google credential required' } });
    }
    const ticketRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!ticketRes.ok) {
      return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Invalid Google token' } });
    }
    const payload = await ticketRes.json();
    const { email, name, sub: googleId, aud, email_verified } = payload;
    // When a client id is configured, require the token to have been minted for it.
    if (config.googleClientId && aud !== config.googleClientId) {
      return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Google token audience mismatch' } });
    }
    if (!email || email_verified === 'false' || email_verified === false) {
      return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Google account email not verified' } });
    }
    let { rows } = await query(
      `SELECT id, phone, email, full_name, role, preferred_locale, is_active FROM users WHERE email = $1`,
      [email]
    );
    let user;
    if (rows.length) {
      user = rows[0];
      if (!user.is_active) {
        return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Account disabled' } });
      }
      await query(`UPDATE users SET last_login_at = NOW() WHERE id = $1`, [user.id]);
    } else {
      ({ rows } = await query(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, 'caregiver')
         RETURNING id, phone, email, full_name, role, preferred_locale`,
        [email, await bcrypt.hash(googleId, config.bcryptCost), name || email.split('@')[0]]
      ));
      user = rows[0];
    }
    const accessToken = signAccessToken(user);
    const refreshToken = uuid();
    const refreshHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO sessions (user_id, refresh_token_hash, device_label, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, refreshHash, 'google', req.headers['user-agent'] || null, expiresAt]
    );
    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: { code: 'internal_error', message: 'Google authentication failed' } });
  }
});

export default router;
