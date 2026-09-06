import jwt from 'jsonwebtoken';
import config from '../config.js';
import { query } from '../db.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'token_expired', message: 'Authentication required' } });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { code: 'token_expired', message: 'Token expired' } });
    }
    return res.status(401).json({ error: { code: 'invalid_credentials', message: 'Invalid token' } });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'insufficient_permission', message: 'Insufficient permissions' } });
    }
    next();
  };
}
