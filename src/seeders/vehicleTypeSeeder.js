require('dotenv').config();
const mongoose = require('mongoose');
const VehicleType = require('../models/cars/VehicleType');
const config = require('../config/config');
const { VEHICLE_TYPES } = require('./constants');

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
    // Only connect if running this file directly
    if (require.main === module) {
      await connectDB();
    }
    
    // Clear existing data
    await VehicleType.deleteMany({});
    console.log('Existing vehicle types deleted');
    
    // Insert new data
    const createdVehicleTypes = await VehicleType.insertMany(vehicleTypes);
    
    console.log(`${createdVehicleTypes.length} vehicle types have been seeded.`);
    
    // Only close connection and exit if running this file directly
    if (require.main === module) {
      await mongoose.connection.close();
      console.log('Database connection closed.');
      process.exit(0);
    }
  } catch (error) {
    console.error(`Error seeding vehicle types: ${error.message}`);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

// Run seeder if this script is executed directly
if (require.main === module) {
  seedVehicleTypes();
}

module.exports = seedVehicleTypes; 