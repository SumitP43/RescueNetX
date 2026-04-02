const Resource = require('../models/Resource');
const { emitResourceUpdate } = require('../sockets/socketHandlers');
const logger = require('../utils/logger');
const { sanitizeString, sanitizeBool } = require('../utils/validators');

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
  const type = sanitizeString(filters.type);
  if (type) query.type = type;

  const availability = sanitizeBool(filters.availability);
  if (availability !== undefined) query.availability = availability;

  return Resource.find(query).populate('assigned_victim', 'name status').sort({ last_updated: -1 });
}

/**
 * Update a resource and broadcast the change.
 * Only a controlled set of fields are accepted to prevent injection.
 */
async function updateResource(id, rawData) {
  const allowedFields = [
    'type', 'name', 'current_location', 'availability',
    'assigned_task', 'assigned_victim', 'metadata',
  ];
  const data = Object.fromEntries(
    Object.entries(rawData).filter(([k]) => allowedFields.includes(k))
  );
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
