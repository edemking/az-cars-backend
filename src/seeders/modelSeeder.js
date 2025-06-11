require('dotenv').config();
const mongoose = require('mongoose');
const Model = require('../models/cars/Model');
const Make = require('../models/cars/Make');
const config = require('../config/config');
const seedMakes = require('./makeSeeder');
const modelsData = require('./data/models.json');

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

const seedModels = async () => {
  try {
    await connectDB();
    
    // Clear existing models
    await Model.deleteMany({});
    
    // Ensure makes are seeded first
    let makes = await Make.find({});
    if (makes.length === 0) {
      console.log('No makes found, seeding makes first...');
      makes = await seedMakes();
    }
    
    // Create a map of make names to their ids for easier lookup
    const makeMap = {};
    makes.forEach(make => {
      makeMap[make.name] = make._id;
    });
    
    // Map the models data to include make IDs instead of make names
    const models = modelsData
      .filter(model => makeMap[model.make]) // Only include models whose make exists
      .map(model => ({
        name: model.name,
        make: makeMap[model.make],
        startYear: model.startYear
      }));
    
    console.log(`Filtering models: ${modelsData.length} total, ${models.length} valid models for existing makes`);
    
    // Insert models
    const createdModels = await Model.insertMany(models);
    
    console.log(`${createdModels.length} car models have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdModels;
  } catch (error) {
    console.error(`Error seeding car models: ${error.message}`);
    
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
  seedModels();
}

module.exports = seedModels; 