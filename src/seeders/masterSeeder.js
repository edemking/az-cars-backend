require('dotenv').config();
const mongoose = require('mongoose');
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

// Import all seeders
const seedMakes = require('./makeSeeder');
const seedModels = require('./modelSeeder');
const seedCarDrives = require('./carDriveSeeder');
const seedBodyColors = require('./bodyColorSeeder');
const seedCarOptions = require('./carOptionSeeder');
const seedFuelTypes = require('./fuelTypeSeeder');
const seedCylinders = require('./cylinderSeeder');
const seedTransmissions = require('./transmissionSeeder');
const seedCountries = require('./countrySeeder');
const seedRatings = require('./ratingSeeder');
const seedCarConditions = require('./carConditionSeeder');
const seedVehicleTypes = require('./vehicleTypeSeeder');
const seedEngineSizes = require('./engineSizeSeeder');
const seedServiceHistories = require('./serviceHistorySeeder');

const runAllSeeders = async () => {
  try {
    console.log('🌱 Starting to seed database...\n');
    
    await connectDB();
    
    // Run seeders in order (reference data first, then cars)
    console.log('📝 Seeding makes...');
    await seedMakes();
    
    console.log('📝 Seeding models...');
    await seedModels();
    
    console.log('📝 Seeding car drives...');
    await seedCarDrives();
    
    console.log('📝 Seeding body colors...');
    await seedBodyColors();
    
    console.log('📝 Seeding car options...');
    await seedCarOptions();
    
    console.log('📝 Seeding fuel types...');
    await seedFuelTypes();
    
    console.log('📝 Seeding cylinders...');
    await seedCylinders();
    
    console.log('📝 Seeding transmissions...');
    await seedTransmissions();
    
    console.log('📝 Seeding countries...');
    await seedCountries();
    
    console.log('📝 Seeding ratings...');
    await seedRatings();
    
    console.log('📝 Seeding car conditions...');
    await seedCarConditions();
    
    console.log('📝 Seeding vehicle types...');
    await seedVehicleTypes();
    
    console.log('📝 Seeding engine sizes...');
    await seedEngineSizes();
    
    console.log('📝 Seeding service histories...');
    await seedServiceHistories();
    
    console.log('\n✅ All seeders completed successfully!');
    console.log('🎉 Database has been populated with all reference data.');
    console.log('📋 Cars can now be created through the API with optional vehicle types.');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('🔐 Database connection closed.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running seeders:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  runAllSeeders();
}

module.exports = runAllSeeders; 