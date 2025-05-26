require('dotenv').config();
const mongoose = require('mongoose');
const EngineSize = require('../models/cars/EngineSize');
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

const engineSizes = [
  { value: 1.0, unit: 'L', description: '1.0L 3-cylinder' },
  { value: 1.2, unit: 'L', description: '1.2L 3-cylinder' },
  { value: 1.4, unit: 'L', description: '1.4L 4-cylinder' },
  { value: 1.5, unit: 'L', description: '1.5L 4-cylinder' },
  { value: 1.6, unit: 'L', description: '1.6L 4-cylinder' },
  { value: 1.8, unit: 'L', description: '1.8L 4-cylinder' },
  { value: 2.0, unit: 'L', description: '2.0L 4-cylinder' },
  { value: 2.4, unit: 'L', description: '2.4L 4-cylinder' },
  { value: 2.5, unit: 'L', description: '2.5L 4-cylinder or 5-cylinder' },
  { value: 2.7, unit: 'L', description: '2.7L 6-cylinder' },
  { value: 3.0, unit: 'L', description: '3.0L 6-cylinder' },
  { value: 3.5, unit: 'L', description: '3.5L 6-cylinder' },
  { value: 3.6, unit: 'L', description: '3.6L 6-cylinder' },
  { value: 4.0, unit: 'L', description: '4.0L 6-cylinder or 8-cylinder' },
  { value: 4.7, unit: 'L', description: '4.7L 8-cylinder' },
  { value: 5.0, unit: 'L', description: '5.0L 8-cylinder' },
  { value: 5.7, unit: 'L', description: '5.7L 8-cylinder' },
  { value: 6.0, unit: 'L', description: '6.0L 8-cylinder or 12-cylinder' },
  { value: 6.2, unit: 'L', description: '6.2L 8-cylinder' },
  { value: 6.7, unit: 'L', description: '6.7L 8-cylinder diesel' },
  { value: 1800, unit: 'cc', description: '1800cc engine' },
  { value: 2000, unit: 'cc', description: '2000cc engine' },
  { value: 2500, unit: 'cc', description: '2500cc engine' },
  { value: 3000, unit: 'cc', description: '3000cc engine' },
  { value: 302, unit: 'ci', description: '302 cubic inch V8' },
  { value: 350, unit: 'ci', description: '350 cubic inch V8' },
  { value: 454, unit: 'ci', description: '454 cubic inch V8' }
];

const seedEngineSizes = async () => {
  try {
    // Only connect if running this file directly
    if (require.main === module) {
      await connectDB();
    }
    
    // Clear existing data
    await EngineSize.deleteMany({});
    console.log('Existing engine sizes deleted');
    
    // Insert new data
    const createdEngineSizes = await EngineSize.insertMany(engineSizes);
    
    console.log(`${createdEngineSizes.length} engine sizes have been seeded.`);
    
    // Only close connection and exit if running this file directly
    if (require.main === module) {
      await mongoose.connection.close();
      console.log('Database connection closed.');
      process.exit(0);
    }
  } catch (error) {
    console.error(`Error seeding engine sizes: ${error.message}`);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  seedEngineSizes();
}

module.exports = seedEngineSizes; 