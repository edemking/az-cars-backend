const mongoose = require('mongoose');

const bodyColorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  hexCode: {
    type: String,
    required: false,
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code']
  },
  type: {
    type: String,
    enum: ['Solid', 'Metallic', 'Pearlescent', 'Matte'],
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BodyColor', bodyColorSchema); 