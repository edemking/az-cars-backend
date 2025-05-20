const mongoose = require('mongoose');

const engineSizeSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['L', 'cc', 'ci'],
    default: 'L',
    required: true
  },
  description: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique combination of value and unit
engineSizeSchema.index({ value: 1, unit: 1 }, { unique: true });

module.exports = mongoose.model('EngineSize', engineSizeSchema); 