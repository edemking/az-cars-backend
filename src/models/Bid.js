const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  },
  isWinningBid: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Create index for efficient queries
BidSchema.index({ auction: 1, amount: -1 });
BidSchema.index({ bidder: 1, auction: 1 });

module.exports = mongoose.model('Bid', BidSchema); 