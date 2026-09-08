import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import config from './config.js';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import gameRoutes from './routes/games.js';
import progressRoutes from './routes/progress.js';
import reminderRoutes from './routes/reminders.js';
import assessmentRoutes from './routes/assessments.js';
import analyticsRoutes from './routes/analytics.js';
import syncRoutes from './routes/sync.js';
import mediaRoutes from './routes/media.js';
import pushRoutes from './routes/push.js';
import alertRoutes from './routes/alerts.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (config.corsOrigin || '').split(',').map(s => s.trim());
    if (!origin || allowed.includes(origin) || allowed.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'nirmal-api', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api', gameRoutes);
app.use('/api', progressRoutes);
app.use('/api', reminderRoutes);
app.use('/api', assessmentRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', syncRoutes);
app.use('/api', mediaRoutes);
app.use('/api', pushRoutes);
app.use('/api', alertRoutes);

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: { code: 'internal_error', message: 'An unexpected error occurred' } });
});

app.listen(config.port, () => {
  console.log(`nirmal-api running on port ${config.port}`);
});
