const Device = require('../models/Device');
const logger = require('../utils/logger');
const { sanitizeString } = require('../utils/validators');

/**
 * Register a new device in the system.
 */
async function registerDevice(data) {
  const device_id = sanitizeString(data.device_id);
  if (!device_id) {
    const err = new Error('Invalid device_id');
    err.statusCode = 400;
    throw err;
  }
  const existing = await Device.findOne({ device_id });
  if (existing) {
    const err = new Error('Device already registered');
    err.statusCode = 409;
    throw err;
  }
  const device = await Device.create({ ...data, device_id });
  logger.info(`Device registered: ${device.device_id}`);
  return device;
}

/**
 * Update the connectivity status (and last_seen) of a device.
 * The status value is validated by middleware; we cast it to string defensively.
 */
async function updateDeviceStatus(id, rawStatus) {
  const status = sanitizeString(rawStatus);
  if (!status) {
    const err = new Error('Invalid status value');
    err.statusCode = 400;
    throw err;
  }
  const update = { connectivity_status: status, last_seen: new Date() };
  const device = await Device.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!device) {
    const err = new Error('Device not found');
    err.statusCode = 404;
    throw err;
  }
  logger.info(`Device ${device.device_id} status → ${status}`);
  return device;
}

/**
 * Return the last known location of a device.
 */
async function getDeviceLocation(id) {
  const device = await Device.findById(id).select('device_id last_known_location last_seen');
  if (!device) {
    const err = new Error('Device not found');
    err.statusCode = 404;
    throw err;
  }
  return device;
}

/**
 * Update the GPS location of a device.
 */
async function updateDeviceLocation(id, location) {
  const device = await Device.findByIdAndUpdate(
    id,
    { last_known_location: location, last_seen: new Date() },
    { new: true }
  );
  if (!device) {
    const err = new Error('Device not found');
    err.statusCode = 404;
    throw err;
  }
  return device;
}

module.exports = { registerDevice, updateDeviceStatus, getDeviceLocation, updateDeviceLocation };
