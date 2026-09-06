const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
  bcryptCost: 12,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  r2Bucket: process.env.R2_BUCKET,
  r2Endpoint: process.env.R2_ENDPOINT,
  r2AccessKey: process.env.R2_ACCESS_KEY,
  r2SecretKey: process.env.R2_SECRET_KEY,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:admin@nirmal.health',
  allowDevLogin: process.env.ALLOW_DEV_LOGIN === 'true',
  rateLimits: {
    login: { windowMs: 15 * 60 * 1000, max: 10 },
    refresh: { windowMs: 15 * 60 * 1000, max: 60 },
    sync: { windowMs: 5 * 60 * 1000, max: 60 },
    upload: { windowMs: 60 * 60 * 1000, max: 100 },
    default: { windowMs: 15 * 60 * 1000, max: 600 },
  },
};

export default config;
