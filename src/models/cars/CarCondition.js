const mongoose = require('mongoose');

const carConditionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: String,
    enum: ["Scratched", "Painted", "Damaged", "Smart Repaint", "Repaired", "Paint", "Scratch", "Dent"],
    required: true
  }
});

module.exports = mongoose.model('CarCondition', carConditionSchema); 