const victimService = require('../services/victimService');
const { extractValidationErrors } = require('../utils/validators');

async function addVictim(req, res, next) {
  try {
    const validationErrors = extractValidationErrors(req);
    if (validationErrors) {
      return res.status(422).json({ success: false, errors: validationErrors });
    }
    const victim = await victimService.addVictim(req.body);
    res.status(201).json({ success: true, data: victim });
  } catch (err) {
    next(err);
  }
}

async function getAllVictims(req, res, next) {
  try {
    const victims = await victimService.getAllVictims();
    res.status(200).json({ success: true, count: victims.length, data: victims });
  } catch (err) {
    next(err);
  }
}

async function getNearbyVictims(req, res, next) {
  try {
    const validationErrors = extractValidationErrors(req);
    if (validationErrors) {
      return res.status(422).json({ success: false, errors: validationErrors });
    }
    const { lat, lng, radius } = req.query;
    const victims = await victimService.getNearbyVictims(lat, lng, radius);
    res.status(200).json({ success: true, count: victims.length, data: victims });
  } catch (err) {
    next(err);
  }
}

async function updateVictim(req, res, next) {
  try {
    const victim = await victimService.updateVictim(req.params.id, req.body);
    res.status(200).json({ success: true, data: victim });
  } catch (err) {
    next(err);
  }
}

module.exports = { addVictim, getAllVictims, getNearbyVictims, updateVictim };
