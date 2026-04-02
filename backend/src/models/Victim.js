const mongoose = require('mongoose');
const { VICTIM_STATUS } = require('../constants');

const victimSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Victim name is required'],
      trim: true,
    },
    location: {
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
    status: {
      type: String,
      enum: Object.values(VICTIM_STATUS),
      required: [true, 'Victim status is required'],
    },
    severity: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    rescuer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    is_rescued: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

victimSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Victim', victimSchema);
