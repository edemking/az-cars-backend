const mongoose = require('mongoose');
const FuelType = require('../models/cars/FuelType');
const connectDB = require('../config/db');

const fuelTypes = [
  {
    name: 'Gasoline',
    category: 'Fossil',
    description: 'Standard gasoline/petrol fuel'
  },
  {
    name: 'Diesel',
    category: 'Fossil',
    description: 'Diesel fuel for compression ignition engines'
  },
  {
    name: 'Premium Gasoline',
    category: 'Fossil',
    description: 'Higher octane gasoline for performance engines'
  },
  {
    name: 'E85 Ethanol',
    category: 'Biofuel',
    description: '85% ethanol, 15% gasoline blend'
  },
  {
    name: 'Biodiesel',
    category: 'Biofuel',
    description: 'Renewable diesel alternative made from biological sources'
  },
  {
    name: 'Electricity',
    category: 'Electric',
    description: 'Electric power for battery electric vehicles'
  },
  {
    name: 'Hybrid Electric/Gasoline',
    category: 'Hybrid',
    description: 'Combination of gasoline and electric power'
  },
  {
    name: 'Hybrid Electric/Diesel',
    category: 'Hybrid',
    description: 'Combination of diesel and electric power'
  },
  {
    name: 'Plug-in Hybrid',
    category: 'Hybrid',
    description: 'Hybrid with larger battery and plug-in charging capability'
  },
  {
    name: 'Compressed Natural Gas (CNG)',
    category: 'Fossil',
    description: 'Natural gas stored under high pressure'
  },
  {
    name: 'Liquefied Petroleum Gas (LPG)',
    category: 'Fossil',
    description: 'Propane or butane stored under pressure'
  },
  {
    name: 'Hydrogen',
    category: 'Other',
    description: 'Hydrogen for fuel cell vehicles'
  }
];

const seedFuelTypes = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await FuelType.deleteMany({});
    
    // Insert new data
    const createdFuelTypes = await FuelType.insertMany(fuelTypes);
    
    console.log(`${createdFuelTypes.length} fuel types have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdFuelTypes;
  } catch (error) {
    console.error(`Error seeding fuel types: ${error.message}`);
    
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
  seedFuelTypes();
}

module.exports = seedFuelTypes; 