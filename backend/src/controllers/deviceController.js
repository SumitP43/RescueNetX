const deviceService = require('../services/deviceService');
const { extractValidationErrors } = require('../utils/validators');

async function registerDevice(req, res, next) {
  try {
    const device = await deviceService.registerDevice(req.body);
    res.status(201).json({ success: true, data: device });
  } catch (err) {
    next(err);
  }
}

async function updateDeviceStatus(req, res, next) {
  try {
    const validationErrors = extractValidationErrors(req);
    if (validationErrors) {
      return res.status(422).json({ success: false, errors: validationErrors });
    }
    const device = await deviceService.updateDeviceStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, data: device });
  } catch (err) {
    next(err);
  }
}

async function getDeviceLocation(req, res, next) {
  try {
    const device = await deviceService.getDeviceLocation(req.params.id);
    res.status(200).json({ success: true, data: device });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerDevice, updateDeviceStatus, getDeviceLocation };
