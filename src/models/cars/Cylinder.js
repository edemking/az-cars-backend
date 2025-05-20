const mongoose = require('mongoose');

const cylinderSchema = new mongoose.Schema({
  count: {
    type: Number,
    required: true,
    min: 1
  },
  configuration: {
    type: String,
    enum: ['Inline', 'V', 'Flat', 'Rotary', 'W', 'Other'],
    required: false
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

// Ensure unique combination of count and configuration
cylinderSchema.index({ count: 1, configuration: 1 }, { unique: true });

module.exports = mongoose.model('Cylinder', cylinderSchema); 