const mongoose = require('mongoose');
const { SIMULATION_TYPES, SEVERITY_LEVELS } = require('../constants');

const simulationDataSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(SIMULATION_TYPES),
      required: [true, 'Simulation type is required'],
    },
    name: {
      type: String,
      required: [true, 'Simulation name is required'],
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
    // Polygon boundary for the affected area [[lng, lat], ...]
    area_coordinates: {
      type: [[Number]],
      default: [],
    },
    severity: {
      type: String,
      enum: Object.values(SEVERITY_LEVELS),
      default: SEVERITY_LEVELS.MEDIUM,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

simulationDataSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SimulationData', simulationDataSchema);
