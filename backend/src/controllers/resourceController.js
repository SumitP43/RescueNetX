const resourceService = require('../services/resourceService');
const { extractValidationErrors } = require('../utils/validators');

async function createResource(req, res, next) {
  try {
    const validationErrors = extractValidationErrors(req);
    if (validationErrors) {
      return res.status(422).json({ success: false, errors: validationErrors });
    }
    const resource = await resourceService.createResource(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
}

async function getAllResources(req, res, next) {
  try {
    const resources = await resourceService.getAllResources(req.query);
    res.status(200).json({ success: true, count: resources.length, data: resources });
  } catch (err) {
    next(err);
  }
}

async function updateResource(req, res, next) {
  try {
    const resource = await resourceService.updateResource(req.params.id, req.body);
    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
}

async function deleteResource(req, res, next) {
  try {
    await resourceService.deleteResource(req.params.id);
    res.status(200).json({ success: true, message: 'Resource deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createResource, getAllResources, updateResource, deleteResource };
