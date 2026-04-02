const authService = require('../services/authService');
const { extractValidationErrors } = require('../utils/validators');

async function register(req, res, next) {
  try {
    const validationErrors = extractValidationErrors(req);
    if (validationErrors) {
      return res.status(422).json({ success: false, errors: validationErrors });
    }
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const validationErrors = extractValidationErrors(req);
    if (validationErrors) {
      return res.status(422).json({ success: false, errors: validationErrors });
    }
    const result = await authService.login(req.body.email, req.body.password);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
