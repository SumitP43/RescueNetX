const express = require('express');
const router = express.Router();
const {
  analyzeRisk,
  prioritizeOperations,
  allocateResources,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/risk', protect, analyzeRisk);
router.post('/prioritize', protect, prioritizeOperations);
router.post('/resource-allocation', protect, allocateResources);

module.exports = router;
