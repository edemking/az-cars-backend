require('dotenv').config();
const mongoose = require('mongoose');
const { Role, PERMISSIONS } = require('../models/Role');
const config = require('../config/config');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedRoles = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Delete existing roles
    await Role.deleteMany({});
    console.log('Existing roles deleted');
    
    // Create default roles
    const adminRole = await Role.create({
      name: 'Super Admin',
      description: 'Full access to all system features',
      permissions: Object.values(PERMISSIONS)
    });
    
    const managerRole = await Role.create({
      name: 'Manager',
      description: 'Access to management features',
      permissions: [
        PERMISSIONS.GENERAL_OVERSIGHT,
        PERMISSIONS.VEHICLE_MANAGEMENT,
        PERMISSIONS.BIDDER_MANAGEMENT,
        PERMISSIONS.MANAGE_AUCTIONS,
        PERMISSIONS.AUCTION_RESULTS
      ]
    });
    
    const vehicleManagerRole = await Role.create({
      name: 'Vehicle Manager',
      description: 'Manages vehicle inventory',
      permissions: [
        PERMISSIONS.VEHICLE_MANAGEMENT
      ]
    });
    
    const auctionManagerRole = await Role.create({
      name: 'Auction Manager',
      description: 'Manages auctions and results',
      permissions: [
        PERMISSIONS.MANAGE_AUCTIONS,
        PERMISSIONS.AUCTION_RESULTS
      ]
    });
    
    const bidderManagerRole = await Role.create({
      name: 'Bidder Manager',
      description: 'Manages bidders',
      permissions: [
        PERMISSIONS.BIDDER_MANAGEMENT
      ]
    });
    
    console.log('Default roles created successfully');
    
    // Close database connection
    await mongoose.connection.close();
    
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
};

// Run the seeder
seedRoles(); 