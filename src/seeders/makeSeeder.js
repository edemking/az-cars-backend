require('dotenv').config();
const mongoose = require('mongoose');
const Make = require('../models/cars/Make');
const config = require('../config/config');
const makes = require('./data/makes.json');

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

const seedMakes = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Make.deleteMany({});
    
    // Insert new data
    const createdMakes = await Make.insertMany(makes);
    
    console.log(`${createdMakes.length} car makes have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdMakes;
  } catch (error) {
    console.error(`Error seeding car makes: ${error.message}`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed due to error.');
    }
    
    process.exit(1);
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  seedMakes();
}

module.exports = seedMakes; 