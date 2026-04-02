const Resource = require('../models/Resource');
const { emitResourceUpdate } = require('../sockets/socketHandlers');
const logger = require('../utils/logger');

/**
 * Create a resource and broadcast the update.
 */
async function createResource(data) {
  const resource = await Resource.create(data);
  emitResourceUpdate({ event: 'created', resource });
  logger.info(`Resource created: ${resource._id}`);
  return resource;
}

/**
 * Return all resources, optionally filtered by type and/or availability.
 */
async function getAllResources(filters = {}) {
  const query = {};
  if (filters.type) query.type = filters.type;
  if (filters.availability !== undefined)
    query.availability = filters.availability === 'true' || filters.availability === true;

  return Resource.find(query).populate('assigned_victim', 'name status').sort({ last_updated: -1 });
}

/**
 * Update a resource and broadcast the change.
 */
async function updateResource(id, data) {
  const resource = await Resource.findByIdAndUpdate(
    id,
    { ...data, last_updated: new Date() },
    { new: true, runValidators: true }
  ).populate('assigned_victim', 'name status');

  if (!resource) {
    const err = new Error('Resource not found');
    err.statusCode = 404;
    throw err;
  }

  emitResourceUpdate({ event: 'updated', resource });
  logger.info(`Resource updated: ${id}`);
  return resource;
}

/**
 * Delete a resource by id.
 */
async function deleteResource(id) {
  const resource = await Resource.findByIdAndDelete(id);
  if (!resource) {
    const err = new Error('Resource not found');
    err.statusCode = 404;
    throw err;
  }
  emitResourceUpdate({ event: 'deleted', resourceId: id });
  logger.info(`Resource deleted: ${id}`);
  return resource;
}

/**
 * Return only resources that are currently available.
 */
async function getAvailableResources() {
  return Resource.find({ availability: true }).sort({ type: 1 });
}

module.exports = {
  createResource,
  getAllResources,
  updateResource,
  deleteResource,
  getAvailableResources,
};
