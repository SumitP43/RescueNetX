const express = require('express');
const router = express.Router();
const {
  addVictim,
  getAllVictims,
  getNearbyVictims,
  updateVictim,
} = require('../controllers/victimController');
const { protect } = require('../middleware/auth');
const { validateVictim, validateNearbyQuery } = require('../utils/validators');

router.post('/', protect, validateVictim, addVictim);
router.get('/', getAllVictims);
router.get('/nearby', validateNearbyQuery, getNearbyVictims);
router.patch('/:id', protect, updateVictim);

module.exports = router;
