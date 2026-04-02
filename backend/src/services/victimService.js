const Victim = require('../models/Victim');
const { emitVictimUpdate } = require('../sockets/socketHandlers');
const logger = require('../utils/logger');

/**
 * Create a new victim record and broadcast the update.
 */
async function addVictim(data) {
  const victim = await Victim.create(data);
  emitVictimUpdate({ event: 'added', victim });
  logger.info(`Victim added: ${victim._id}`);
  return victim;
}

/**
 * Update an existing victim record and broadcast the update.
 */
async function updateVictim(id, data) {
  const victim = await Victim.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!victim) {
    const err = new Error('Victim not found');
    err.statusCode = 404;
    throw err;
  }
  emitVictimUpdate({ event: 'updated', victim });
  logger.info(`Victim updated: ${id}`);
  return victim;
}

/**
 * Find victims within a given radius (metres) of a coordinate using $nearSphere.
 */
async function getNearbyVictims(lat, lng, radius = 5000) {
  const victims = await Victim.find({
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseFloat(radius),
      },
    },
  });
  return victims;
}

/**
 * Return all victims, most recent first.
 */
async function getAllVictims() {
  return Victim.find().sort({ timestamp: -1 });
}

module.exports = { addVictim, updateVictim, getNearbyVictims, getAllVictims };
