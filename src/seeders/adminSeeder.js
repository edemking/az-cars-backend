require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { Role } = require('../models/Role');
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

// Seed admin user
const seedAdmin = async () => {
  try {
    await connectDB();
    
    // Find or create the Super Admin role
    let adminRole = await Role.findOne({ name: 'Super Admin' });
    
    if (!adminRole) {
      console.log('Super Admin role not found, please run the role seeder first (npm run seed:roles)');
      process.exit(1);
    }
    
    // Admin user data
    const adminUser = {
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+1234567890',
      email: 'admin@mail.com',
      password: 'admin', // This will be hashed by the User model pre-save hook
      role: adminRole._id,
      country: 'UAE',
      address: 'Dubai, UAE',
      idFront: 'admin_id_front.jpg',
      idBack: 'admin_id_back.jpg'
    };
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      await User.create(adminUser);
      console.log('Admin user created successfully');
    }
    
    // Disconnect after seeding
    mongoose.disconnect();
    console.log('MongoDB Disconnected');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the seeder
seedAdmin(); 