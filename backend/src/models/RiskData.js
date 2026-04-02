const mongoose = require('mongoose');
const { SEVERITY_LEVELS } = require('../constants');

const riskDataSchema = new mongoose.Schema(
  {
    risk_type: {
      type: String,
      required: [true, 'Risk type is required'],
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
    risk_level: {
      type: String,
      enum: Object.values(SEVERITY_LEVELS),
      required: [true, 'Risk level is required'],
    },
    confidence_score: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    analysis_data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    recommendations: {
      type: [String],
      default: [],
    },
    affected_area: {
      type: Number, // radius in metres
      default: null,
    },
    source: {
      type: String,
      default: 'ai',
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

riskDataSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('RiskData', riskDataSchema);
