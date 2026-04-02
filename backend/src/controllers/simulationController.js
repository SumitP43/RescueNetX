const SimulationData = require('../models/SimulationData');

async function getHazards(req, res, next) {
  try {
    const hazards = await SimulationData.find({ type: 'hazard', is_active: true }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, count: hazards.length, data: hazards });
  } catch (err) {
    next(err);
  }
}

async function getFloodZones(req, res, next) {
  try {
    const floods = await SimulationData.find({ type: 'flood', is_active: true }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, count: floods.length, data: floods });
  } catch (err) {
    next(err);
  }
}

async function getBlockedRoads(req, res, next) {
  try {
    const blocked = await SimulationData.find({ type: 'blocked_road', is_active: true }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, count: blocked.length, data: blocked });
  } catch (err) {
    next(err);
  }
}

module.exports = { getHazards, getFloodZones, getBlockedRoads };
