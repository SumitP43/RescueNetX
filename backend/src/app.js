const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

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
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
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
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'RescueNet X API is running', version: '1.0.0' });
});

// ── API routes ───────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/sos`, sosRoutes);
app.use(`${API}/victim`, victimRoutes);
app.use(`${API}/resource`, resourceRoutes);
app.use(`${API}/ai`, aiRoutes);
app.use(`${API}/device`, deviceRoutes);
app.use(`${API}/sync`, syncRoutes);
app.use(`${API}/simulation`, simulationRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
