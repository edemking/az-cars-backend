const mongoose = require('mongoose');
const VehicleType = require('../models/VehicleType');
const connectDB = require('../config/db');

const vehicleTypes = [
  {
    name: 'Sedan',
    description: 'A conventional car with four doors and a trunk'
  },
  {
    name: 'SUV',
    description: 'Sport Utility Vehicle with increased ground clearance and cargo space'
  },
  {
    name: 'Hatchback',
    description: 'A car with a rear door that swings upward'
  },
  {
    name: 'Coupe',
    description: 'A two-door car with a fixed roof'
  },
  {
    name: 'Convertible',
    description: 'A car with a folding or detachable roof'
  },
  {
    name: 'Wagon',
    description: 'A car with extended roofline and cargo area'
  },
  {
    name: 'Crossover',
    description: 'A vehicle with SUV styling but based on a car platform'
  },
  {
    name: 'Minivan',
    description: 'A van designed for passenger use'
  },
  {
    name: 'Pickup',
    description: 'A light-duty truck with an open cargo area'
  },
  {
    name: 'Sports Car',
    description: 'A car designed for performance and high speed'
  }
];

const seedVehicleTypes = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await VehicleType.deleteMany({});
    
    // Insert new data
    const createdVehicleTypes = await VehicleType.insertMany(vehicleTypes);
    
    console.log(`${createdVehicleTypes.length} vehicle types have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdVehicleTypes;
  } catch (error) {
    console.error(`Error seeding vehicle types: ${error.message}`);
    
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
  seedVehicleTypes();
}

module.exports = seedVehicleTypes; 