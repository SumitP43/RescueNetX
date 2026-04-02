const sosService = require('../services/sosService');
const { extractValidationErrors } = require('../utils/validators');

async function sendSOS(req, res, next) {
  try {
    const validationErrors = extractValidationErrors(req);
    if (validationErrors) {
      return res.status(422).json({ success: false, errors: validationErrors });
    }
    const message = await sosService.createSOS(req.body, req.user._id);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
}

async function getAllSOS(req, res, next) {
  try {
    const result = await sosService.getAllSOS(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function getSOSById(req, res, next) {
  try {
    const message = await sosService.getSOSById(req.params.id);
    res.status(200).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
}

async function syncMessages(req, res, next) {
  try {
    const { messages, device_id } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'messages must be an array' });
    }
    const result = await sosService.syncMessages(messages, device_id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendSOS, getAllSOS, getSOSById, syncMessages };
