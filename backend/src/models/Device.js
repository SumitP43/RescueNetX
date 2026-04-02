const mongoose = require('mongoose');
const { DEVICE_STATUS } = require('../constants');

const deviceSchema = new mongoose.Schema(
  {
    device_id: {
      type: String,
      required: [true, 'Device ID is required'],
      unique: true,
      trim: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    connectivity_status: {
      type: String,
      enum: Object.values(DEVICE_STATUS),
      default: DEVICE_STATUS.OFFLINE,
    },
    last_known_location: {
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
    battery_level: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    last_seen: {
      type: Date,
      default: null,
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

deviceSchema.index({ last_known_location: '2dsphere' });

module.exports = mongoose.model('Device', deviceSchema);
