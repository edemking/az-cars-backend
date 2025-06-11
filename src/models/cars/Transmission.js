const mongoose = require('mongoose');

const transmissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Automatic', 'Manual'],
    required: true
  },
  gears: {
    type: Number,
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

module.exports = mongoose.model('Transmission', transmissionSchema); 