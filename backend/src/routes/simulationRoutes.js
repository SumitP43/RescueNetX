const express = require('express');
const router = express.Router();
const {
  getHazards,
  getFloodZones,
  getBlockedRoads,
} = require('../controllers/simulationController');

router.get('/hazards', getHazards);
router.get('/floods', getFloodZones);
router.get('/blocked-roads', getBlockedRoads);

module.exports = router;
