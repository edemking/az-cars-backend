const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: String,
    enum: ["Good", "Average", "Above Average"],
    required: true
  }
});

module.exports = mongoose.model('Rating', ratingSchema); 