const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sanitizeString } = require('../utils/validators');

/**
 * Generate a signed JWT for the given user id.
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
}

/**
 * Register a new user.
 * Password hashing is handled by the User pre-save hook.
 */
async function register(userData) {
  const { name, password, role } = userData;
  const email = sanitizeString(userData.email);
  if (!email) {
    const err = new Error('Invalid email');
    err.statusCode = 400;
    throw err;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user._id);

  logger.info(`New user registered: ${email}`);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
}

/**
 * Authenticate a user and return a JWT.
 */
async function login(rawEmail, password) {
  const email = sanitizeString(rawEmail);
  if (!email) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
  // Explicitly select password field (excluded by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error('Account is deactivated');
    err.statusCode = 403;
    throw err;
  }

  const token = generateToken(user._id);
  logger.info(`User logged in: ${email}`);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
}

module.exports = { register, login, generateToken };
