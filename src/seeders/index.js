const mongoose = require('mongoose');
const config = require('../config/config');

// Import all seeders
const seedMakes = require('./makeSeeder');
const seedModels = require('./modelSeeder');
const seedFuelTypes = require('./fuelTypeSeeder');
const seedCylinders = require('./cylinderSeeder');
const seedBodyColors = require('./bodyColorSeeder');
const seedCarOptions = require('./carOptionSeeder');
const seedTransmissions = require('./transmissionSeeder');
const seedCountries = require('./countrySeeder');
const seedRatings = require('./ratingSeeder');
const seedCarConditions = require('./carConditionSeeder');
const seedCarDrives = require('./carDriveSeeder');
const seedServiceHistory = require('./serviceHistorySeeder');
const seedCars = require('./carSeeder');

const seedDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to MongoDB');

    // Run all seeders in order
    console.log('Starting to seed reference data...');
    
    // First seed all reference data
    await seedMakes();
    await seedModels();
    await seedFuelTypes();
    await seedCylinders();
    await seedBodyColors();
    await seedCarOptions();
    await seedTransmissions();
    await seedCountries();
    await seedRatings();
    await seedCarConditions();
    await seedCarDrives();
    
    console.log('Reference data seeded successfully');
    
    // Then seed service history and cars
    console.log('Starting to seed service history and cars...');
    await seedServiceHistory();
    await seedCars();
    
    console.log('Database seeding completed successfully');
    
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.connection.close();
    console.log('Database connection closed due to error');
    process.exit(1);
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase; 