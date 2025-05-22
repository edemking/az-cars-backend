const mongoose = require("mongoose");

// Define the available permissions
const PERMISSIONS = {
  GENERAL_OVERSIGHT: 'General Oversight',
  VEHICLE_MANAGEMENT: 'Vehicle Management',
  BIDDER_MANAGEMENT: 'Bidder Management',
  MANAGE_AUCTIONS: 'Manage Auctions',
  AUCTION_RESULTS: 'Auction Results',
  USER_ROLES_MANAGEMENT: 'User & Roles Management'
};

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  permissions: [{
    type: String,
    enum: Object.values(PERMISSIONS)
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = {
  Role: mongoose.model("Role", roleSchema),
  PERMISSIONS
}; 