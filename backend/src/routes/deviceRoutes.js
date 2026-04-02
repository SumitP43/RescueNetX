const express = require('express');
const router = express.Router();
const {
  registerDevice,
  updateDeviceStatus,
  getDeviceLocation,
} = require('../controllers/deviceController');
const { validateDeviceStatus } = require('../utils/validators');

router.post('/register', registerDevice);
router.patch('/:id/status', validateDeviceStatus, updateDeviceStatus);
router.get('/:id/location', getDeviceLocation);

module.exports = router;
