const mongoose = require('mongoose');

const serviceHistorySchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['Oil Change', 'Tire Rotation', 'Brake Service', 'Engine Service', 'Transmission Service', 
           'Regular Maintenance', 'Major Repair', 'Other'],
    required: true
  },
  serviceDate: {
    type: Date,
    required: true
  },
  mileage: {
    type: Number,
    required: true
  },
  serviceProvider: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  cost: {
    type: Number,
    required: false
  },
  documents: [{
    type: String, // URLs or paths to service documents
    required: false
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ServiceHistory', serviceHistorySchema); 