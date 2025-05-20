const mongoose = require('mongoose');

const carDriveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ["FWD", "RWD", "AWD"],
    required: true
  },
  description: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('CarDrive', carDriveSchema); 