const mongoose = require('mongoose');
const ServiceHistory = require('../models/cars/ServiceHistory');
const connectDB = require('../config/db');

// Car IDs from carSeeder.js
const CAR_IDS = {
  TOYOTA_CAMRY: new mongoose.Types.ObjectId('6470a9ae10b5d12345690001'),
  HONDA_CIVIC: new mongoose.Types.ObjectId('6470a9ae10b5d12345690002')
};

const serviceHistories = [
  {
    _id: new mongoose.Types.ObjectId('6470a9ae10b5d12345680001'),
    car: CAR_IDS.TOYOTA_CAMRY,
    serviceType: 'Regular Maintenance',
    serviceDate: new Date(2023, 11, 15), // December 15, 2023
    mileage: 14000,
    serviceProvider: 'Toyota Service Center',
    description: 'Regular scheduled maintenance including oil change, filter replacements, and inspection',
    cost: 299.99
  },
  {
    _id: new mongoose.Types.ObjectId('6470a9ae10b5d12345680002'),
    car: CAR_IDS.HONDA_CIVIC,
    serviceType: 'Regular Maintenance',
    serviceDate: new Date(2023, 10, 20), // November 20, 2023
    mileage: 19000,
    serviceProvider: 'Honda Service Center',
    description: 'Regular scheduled maintenance including oil change, filter replacements, and inspection',
    cost: 279.99
  }
];

const seedServiceHistory = async () => {
  try {
    await connectDB();
    
    // Clear existing service history
    await ServiceHistory.deleteMany({});
    
    // Insert service history records
    const createdServiceHistories = await ServiceHistory.insertMany(serviceHistories);
    
    console.log(`${createdServiceHistories.length} service history records have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdServiceHistories;
  } catch (error) {
    console.error(`Error seeding service history: ${error.message}`);
    
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
  seedServiceHistory();
}

module.exports = seedServiceHistory; 