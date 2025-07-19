const mongoose = require('mongoose');

const carOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Safety', 'Entertainment', 'Comfort', 'Performance', 'Exterior', 'Interior', 'Other'],
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

module.exports = mongoose.model('CarOption', carOptionSchema); 