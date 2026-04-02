const express = require('express');
const router = express.Router();
const {
  createResource,
  getAllResources,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');
const { validateResource } = require('../utils/validators');

router.post('/', protect, validateResource, createResource);
router.get('/', getAllResources);
router.patch('/:id', protect, updateResource);
router.delete('/:id', protect, deleteResource);

module.exports = router;
