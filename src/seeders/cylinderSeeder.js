const mongoose = require('mongoose');
const Cylinder = require('../models/cars/Cylinder');
const connectDB = require('../config/db');

const cylinders = [
  {
    count: 3,
    configuration: 'Inline',
    description: '3-cylinder inline engine'
  },
  {
    count: 4,
    configuration: 'Inline',
    description: '4-cylinder inline engine'
  },
  {
    count: 4,
    configuration: 'Flat',
    description: '4-cylinder boxer/flat engine'
  },
  {
    count: 5,
    configuration: 'Inline',
    description: '5-cylinder inline engine'
  },
  {
    count: 6,
    configuration: 'V',
    description: '6-cylinder V engine'
  },
  {
    count: 6,
    configuration: 'Inline',
    description: '6-cylinder inline engine'
  },
  {
    count: 6,
    configuration: 'Flat',
    description: '6-cylinder boxer/flat engine'
  },
  {
    count: 8,
    configuration: 'V',
    description: '8-cylinder V engine'
  },
  {
    count: 10,
    configuration: 'V',
    description: '10-cylinder V engine'
  },
  {
    count: 12,
    configuration: 'V',
    description: '12-cylinder V engine'
  },
  {
    count: 12,
    configuration: 'W',
    description: '12-cylinder W engine'
  },
  {
    count: 16,
    configuration: 'W',
    description: '16-cylinder W engine'
  },
  {
    count: 2,
    configuration: 'Rotary',
    description: '2-rotor Wankel rotary engine'
  },
  {
    count: 3,
    configuration: 'Rotary',
    description: '3-rotor Wankel rotary engine'
  }
];

const seedCylinders = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Cylinder.deleteMany({});
    
    // Insert new data
    const createdCylinders = await Cylinder.insertMany(cylinders);
    
    console.log(`${createdCylinders.length} cylinders have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdCylinders;
  } catch (error) {
    console.error(`Error seeding cylinders: ${error.message}`);
    
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
  seedCylinders();
}

module.exports = seedCylinders; 