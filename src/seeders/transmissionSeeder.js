const mongoose = require('mongoose');
const Transmission = require('../models/cars/Transmission');
const connectDB = require('../config/db');

const transmissions = [
  {
    name: '5-Speed Manual',
    type: 'Manual',
    gears: 5,
    description: 'Traditional 5-speed manual transmission'
  },
  {
    name: '6-Speed Manual',
    type: 'Manual',
    gears: 6,
    description: 'Traditional 6-speed manual transmission'
  },
  {
    name: '4-Speed Automatic',
    type: 'Automatic',
    gears: 4,
    description: 'Traditional 4-speed automatic transmission'
  },
  {
    name: '5-Speed Automatic',
    type: 'Automatic',
    gears: 5,
    description: 'Traditional 5-speed automatic transmission'
  },
  {
    name: '6-Speed Automatic',
    type: 'Automatic',
    gears: 6,
    description: 'Traditional 6-speed automatic transmission'
  },
  {
    name: '8-Speed Automatic',
    type: 'Automatic',
    gears: 8,
    description: 'Advanced 8-speed automatic transmission'
  },
  {
    name: '10-Speed Automatic',
    type: 'Automatic',
    gears: 10,
    description: 'Advanced 10-speed automatic transmission'
  },
  {
    name: 'CVT',
    type: 'CVT',
    description: 'Continuously Variable Transmission'
  },
  {
    name: '7-Speed DSG',
    type: 'Dual-Clutch',
    gears: 7,
    description: 'Dual-clutch automated manual transmission'
  },
  {
    name: '8-Speed DCT',
    type: 'Dual-Clutch',
    gears: 8,
    description: 'Dual-clutch transmission with 8 gears'
  },
  {
    name: 'AMT',
    type: 'Semi-Automatic',
    description: 'Automated Manual Transmission'
  }
];

const seedTransmissions = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Transmission.deleteMany({});
    
    // Insert new data
    const createdTransmissions = await Transmission.insertMany(transmissions);
    
    console.log(`${createdTransmissions.length} transmissions have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdTransmissions;
  } catch (error) {
    console.error(`Error seeding transmissions: ${error.message}`);
    
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
  seedTransmissions();
}

module.exports = seedTransmissions; 