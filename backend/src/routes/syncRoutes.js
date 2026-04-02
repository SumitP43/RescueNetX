const express = require('express');
const router = express.Router();
const { syncMessages } = require('../controllers/sosController');
const { protect } = require('../middleware/auth');

// Sync offline-queued messages from a device back to the server
router.post('/messages', protect, syncMessages);

module.exports = router;
