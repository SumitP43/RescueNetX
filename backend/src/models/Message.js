const mongoose = require('mongoose');
const { SEVERITY_LEVELS } = require('../constants');

const messageSchema = new mongoose.Schema(
  {
    message_id: {
      type: String,
      unique: true,
      default: () => require('crypto').randomUUID(),
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    device_id: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    message_type: {
      type: String,
      enum: ['sos', 'chat', 'sync'],
      default: 'sos',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    severity: {
      type: String,
      enum: Object.values(SEVERITY_LEVELS),
      default: SEVERITY_LEVELS.MEDIUM,
    },
    is_synced: {
      type: Boolean,
      default: false,
    },
    is_delivered: {
      type: Boolean,
      default: false,
    },
    synced_at: {
      type: Date,
      default: null,
    },
    delivered_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

messageSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Message', messageSchema);
