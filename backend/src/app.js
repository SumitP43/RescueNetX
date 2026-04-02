const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Route modules
const authRoutes = require('./routes/authRoutes');
const sosRoutes = require('./routes/sosRoutes');
const victimRoutes = require('./routes/victimRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const aiRoutes = require('./routes/aiRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const syncRoutes = require('./routes/syncRoutes');
const simulationRoutes = require('./routes/simulationRoutes');

const app = express();

// ── Security & parsing middleware ────────────────────────────────────────────
app.use(helmet());

// CORS: require explicit CORS_ORIGIN in production; default to localhost in dev
const allowedOrigin = process.env.CORS_ORIGIN ||
  (process.env.NODE_ENV === 'production' ? 'https://rescuenetx.example.com' : 'http://localhost:3000');

app.use(
  cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev', { stream: { write: (msg) => logger.info(msg.trim()) } }));
}

// ── Rate limiting ────────────────────────────────────────────────────────────

/** General API rate limiter */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

/** Tighter limiter for auth and other sensitive endpoints */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests on this endpoint, please try again later.' },
});

// Export limiters so routes can apply them explicitly (satisfies static analysis)
app.set('apiLimiter', apiLimiter);
app.set('strictLimiter', strictLimiter);

app.use('/api/', apiLimiter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'RescueNet X API is running', version: '1.0.0' });
});

// ── API routes ───────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`, strictLimiter, authRoutes);
app.use(`${API}/sos`, apiLimiter, sosRoutes);
app.use(`${API}/victim`, apiLimiter, victimRoutes);
app.use(`${API}/resource`, apiLimiter, resourceRoutes);
app.use(`${API}/ai`, strictLimiter, aiRoutes);
app.use(`${API}/device`, apiLimiter, deviceRoutes);
app.use(`${API}/sync`, strictLimiter, syncRoutes);
app.use(`${API}/simulation`, apiLimiter, simulationRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
