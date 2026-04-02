const mongoose = require('mongoose');
const { RESOURCE_TYPES } = require('../constants');

const resourceSchema = new mongoose.Schema(
  {
    resource_id: {
      type: String,
      unique: true,
      default: () => require('crypto').randomUUID(),
    },
    type: {
      type: String,
      enum: Object.values(RESOURCE_TYPES),
      required: [true, 'Resource type is required'],
    },
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
    },
    current_location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    availability: {
      type: Boolean,
      default: true,
    },
    assigned_task: {
      type: String,
      default: null,
    },
    assigned_victim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Victim',
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

resourceSchema.index({ current_location: '2dsphere' });

module.exports = mongoose.model('Resource', resourceSchema);
