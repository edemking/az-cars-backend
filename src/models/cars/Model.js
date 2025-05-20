const mongoose = require('mongoose');

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  make: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Make',
    required: true
  },
  startYear: {
    type: Number,
    required: false
  },
  endYear: {
    type: Number,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure name is unique per make
modelSchema.index({ name: 1, make: 1 }, { unique: true });

module.exports = mongoose.model('Model', modelSchema); 