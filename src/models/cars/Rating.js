const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    unique: true
  },
  value: {
    type: String,
    enum: ["Good", "Average", "Above Average"],
    required: false
  }
});

module.exports = mongoose.model('Rating', ratingSchema); 