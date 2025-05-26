const mongoose = require('mongoose');
const VehicleType = require('../models/cars/VehicleType');
const connectDB = require('../config/db');
const { VEHICLE_TYPES } = require('./constants');

const vehicleTypes = [
  {
    _id: VEHICLE_TYPES.SEDAN,
    name: 'Sedan',
    description: 'A conventional car with four doors and a trunk'
  },
  {
    _id: VEHICLE_TYPES.SUV,
    name: 'SUV',
    description: 'Sport Utility Vehicle with increased ground clearance and cargo space'
  },
  {
    _id: VEHICLE_TYPES.HATCHBACK,
    name: 'Hatchback',
    description: 'A car with a rear door that swings upward'
  },
  {
    _id: VEHICLE_TYPES.COUPE,
    name: 'Coupe',
    description: 'A two-door car with a fixed roof'
  },
  {
    _id: VEHICLE_TYPES.CONVERTIBLE,
    name: 'Convertible',
    description: 'A car with a folding or detachable roof'
  },
  {
    _id: VEHICLE_TYPES.WAGON,
    name: 'Wagon',
    description: 'A car with extended roofline and cargo area'
  },
  {
    _id: VEHICLE_TYPES.CROSSOVER,
    name: 'Crossover',
    description: 'A vehicle with SUV styling but based on a car platform'
  },
  {
    _id: VEHICLE_TYPES.MINIVAN,
    name: 'Minivan',
    description: 'A van designed for passenger use'
  },
  {
    _id: VEHICLE_TYPES.PICKUP,
    name: 'Pickup',
    description: 'A light-duty truck with an open cargo area'
  },
  {
    _id: VEHICLE_TYPES.SPORTS_CAR,
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