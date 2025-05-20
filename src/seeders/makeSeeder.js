const mongoose = require('mongoose');
const Make = require('../models/cars/Make');
const connectDB = require('../config/db');

const makes = [
  {
    name: 'Toyota',
    country: 'Japan'
  },
  {
    name: 'Honda',
    country: 'Japan'
  },
  {
    name: 'Ford',
    country: 'USA'
  },
  {
    name: 'Chevrolet',
    country: 'USA'
  },
  {
    name: 'BMW',
    country: 'Germany'
  },
  {
    name: 'Mercedes-Benz',
    country: 'Germany'
  },
  {
    name: 'Audi',
    country: 'Germany'
  },
  {
    name: 'Volkswagen',
    country: 'Germany'
  },
  {
    name: 'Hyundai',
    country: 'South Korea'
  },
  {
    name: 'Kia',
    country: 'South Korea'
  },
  {
    name: 'Nissan',
    country: 'Japan'
  },
  {
    name: 'Mazda',
    country: 'Japan'
  },
  {
    name: 'Subaru',
    country: 'Japan'
  },
  {
    name: 'Lexus',
    country: 'Japan'
  },
  {
    name: 'Volvo',
    country: 'Sweden'
  }
];

const seedMakes = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Make.deleteMany({});
    
    // Insert new data
    const createdMakes = await Make.insertMany(makes);
    
    console.log(`${createdMakes.length} car makes have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdMakes;
  } catch (error) {
    console.error(`Error seeding car makes: ${error.message}`);
    
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
  seedMakes();
}

module.exports = seedMakes; 