const Message = require('../models/Message');
const { emitNewSOS } = require('../sockets/socketHandlers');
const logger = require('../utils/logger');
const { sanitizeString, sanitizeBool } = require('../utils/validators');

/**
 * Create a new SOS message and broadcast it in real-time.
 */
async function createSOS(data, userId) {
  const message = await Message.create({
    ...data,
    sender_id: userId,
    message_type: 'sos',
  });

  const populated = await message.populate('sender_id', 'name email role');
  emitNewSOS(populated);
  logger.info(`SOS created by user ${userId}: ${message._id}`);
  return populated;
}

/**
 * Return all SOS messages with optional filters and pagination.
 */
async function getAllSOS(filters = {}) {
  const { page = 1, limit = 20 } = filters;
  const query = { message_type: 'sos' };

  const severity = sanitizeString(filters.severity);
  if (severity) query.severity = severity;

  const isDelivered = sanitizeBool(filters.is_delivered);
  if (isDelivered !== undefined) query.is_delivered = isDelivered;

  const skip = (Number(page) - 1) * Number(limit);

  const [messages, total] = await Promise.all([
    Message.find(query)
      .populate('sender_id', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Message.countDocuments(query),
  ]);

  return { messages, total, page: Number(page), limit: Number(limit) };
}

/**
 * Return a single SOS message by its MongoDB _id.
 */
async function getSOSById(id) {
  const message = await Message.findById(id).populate('sender_id', 'name email role');
  if (!message) {
    const err = new Error('SOS message not found');
    err.statusCode = 404;
    throw err;
  }
  return message;
}

/**
 * Merge offline-queued messages from a device, skipping duplicates.
 * Deduplication is based on the message_id field.
 */
async function syncMessages(messages, deviceId) {
  const results = { synced: 0, skipped: 0, errors: 0 };

  for (const msg of messages) {
    try {
      // Check for existing record by client-provided message_id
      const safeMessageId = msg.message_id ? sanitizeString(msg.message_id) : null;
      const exists = safeMessageId
        ? await Message.findOne({ message_id: safeMessageId })
        : null;

      if (exists) {
        results.skipped += 1;
        continue;
      }

      await Message.create({
        ...msg,
        device_id: deviceId,
        is_synced: true,
        synced_at: new Date(),
      });
      results.synced += 1;
    } catch (err) {
      logger.error(`Sync error for message: ${err.message}`);
      results.errors += 1;
    }
  }

  logger.info(`Sync complete for device ${deviceId}: ${JSON.stringify(results)}`);
  return results;
}

module.exports = { createSOS, getAllSOS, getSOSById, syncMessages };
