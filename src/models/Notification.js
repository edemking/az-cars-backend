const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['bid_placed', 'outbid', 'auction_won', 'auction_lost', 'auction_ending_soon', 'new_bid_on_auction', 'new_auction_created'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  bid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    bidAmount: Number,
    previousHighestBid: Number,
    auctionTitle: String,
    carDetails: String
  }
}, { timestamps: true });

// Create indexes for efficient queries
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema); 