const RiskData = require('../models/RiskData');
const SimulationData = require('../models/SimulationData');
const logger = require('../utils/logger');

/**
 * Find all risk data records near a given location.
 * @param {object} location - GeoJSON Point { type, coordinates }
 * @param {number} radiusMetres - search radius in metres (default 10 km)
 */
async function checkHighRiskZones(location, radiusMetres = 10000) {
  const risks = await RiskData.find({
    location: {
      $nearSphere: {
        $geometry: location,
        $maxDistance: radiusMetres,
      },
    },
    risk_level: { $in: ['high', 'critical'] },
  }).limit(20);

  return risks;
}

/**
 * Simulate sending an alert notification to a set of users.
 * In production this would integrate with FCM / SMS / email.
 */
async function sendAlert(users, message, type = 'info') {
  logger.info(`[ALERT] type=${type} message="${message}" recipients=${users.length}`);
  // Placeholder: iterate recipients and log
  users.forEach((u) => logger.debug(`  → Notifying user ${u}`));
  return { sent: users.length, type, message };
}

/**
 * Find active simulation events (disasters) near a coordinate.
 */
async function checkNearbyDisasters(lat, lng, radiusMetres = 10000) {
  const disasters = await SimulationData.find({
    is_active: true,
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: radiusMetres,
      },
    },
  }).limit(20);

  return disasters;
}

module.exports = { checkHighRiskZones, sendAlert, checkNearbyDisasters };
