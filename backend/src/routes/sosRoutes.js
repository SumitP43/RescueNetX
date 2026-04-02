const express = require('express');
const router = express.Router();
const { sendSOS, getAllSOS, getSOSById } = require('../controllers/sosController');
const { protect } = require('../middleware/auth');
const { validateSOS } = require('../utils/validators');

router.post('/', protect, validateSOS, sendSOS);
router.get('/', getAllSOS);
router.get('/:id', getSOSById);

module.exports = router;
