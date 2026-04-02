const { body, param, query, validationResult } = require('express-validator');

/**
 * Extracts and returns the first validation error, or null if none.
 */
function extractValidationErrors(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errors.array().map((e) => ({ field: e.path, message: e.msg }));
  }
  return null;
}

// ── Auth validators ──────────────────────────────────────────────────────────

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['rescuer', 'civilian', 'admin'])
    .withMessage('Invalid role'),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── SOS validators ───────────────────────────────────────────────────────────

const validateSOS = [
  body('content').trim().notEmpty().withMessage('Message content is required'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates [lng, lat] are required'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
];

// ── Victim validators ────────────────────────────────────────────────────────

const validateVictim = [
  body('name').trim().notEmpty().withMessage('Victim name is required'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates [lng, lat] are required'),
  body('status')
    .isIn(['critical', 'injured', 'safe'])
    .withMessage('Invalid victim status'),
  body('severity').optional().trim(),
];

// ── Resource validators ──────────────────────────────────────────────────────

const validateResource = [
  body('type')
    .isIn(['rescue_team', 'ambulance', 'drone'])
    .withMessage('Invalid resource type'),
  body('name').trim().notEmpty().withMessage('Resource name is required'),
  body('current_location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates [lng, lat] are required'),
];

// ── Device validators ────────────────────────────────────────────────────────

const validateDeviceStatus = [
  body('status')
    .isIn(['online', 'offline', 'mesh'])
    .withMessage('Invalid device status'),
];

// ── Geospatial query validators ──────────────────────────────────────────────

const validateNearbyQuery = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('lng').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Radius must be a positive number (metres)'),
];

/**
 * Sanitize a value to a plain string, stripping any MongoDB operator objects.
 * Prevents NoSQL injection where user supplies `{ $gt: "" }` instead of a string.
 */
function sanitizeString(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return null; // reject operator objects
  return String(value);
}

/**
 * Sanitize a boolean-like query string value.
 */
function sanitizeBool(value) {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return undefined;
}

module.exports = {
  extractValidationErrors,
  validateRegister,
  validateLogin,
  validateSOS,
  validateVictim,
  validateResource,
  validateDeviceStatus,
  validateNearbyQuery,
  sanitizeString,
  sanitizeBool,
};
