const mongoose = require('mongoose');

const fuelTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Fossil', 'Biofuel', 'Electric', 'Hybrid', 'Other'],
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

module.exports = mongoose.model('FuelType', fuelTypeSchema); 