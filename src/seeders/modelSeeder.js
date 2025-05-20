const mongoose = require('mongoose');
const Model = require('../models/cars/Model');
const Make = require('../models/cars/Make');
const connectDB = require('../config/db');
const seedMakes = require('./makeSeeder');

const seedModels = async () => {
  try {
    await connectDB();
    
    // Clear existing models
    await Model.deleteMany({});
    
    // Ensure makes are seeded first
    let makes = await Make.find({});
    if (makes.length === 0) {
      console.log('No makes found, seeding makes first...');
      makes = await seedMakes();
    }
    
    // Create a map of make names to their ids for easier lookup
    const makeMap = {};
    makes.forEach(make => {
      makeMap[make.name] = make._id;
    });
    
    // Define models with their corresponding makes
    const models = [
      // Toyota Models
      { name: 'Camry', make: makeMap['Toyota'], startYear: 1982 },
      { name: 'Corolla', make: makeMap['Toyota'], startYear: 1966 },
      { name: 'RAV4', make: makeMap['Toyota'], startYear: 1994 },
      { name: 'Highlander', make: makeMap['Toyota'], startYear: 2000 },
      
      // Honda Models
      { name: 'Civic', make: makeMap['Honda'], startYear: 1972 },
      { name: 'Accord', make: makeMap['Honda'], startYear: 1976 },
      { name: 'CR-V', make: makeMap['Honda'], startYear: 1995 },
      { name: 'Pilot', make: makeMap['Honda'], startYear: 2002 },
      
      // Ford Models
      { name: 'F-150', make: makeMap['Ford'], startYear: 1975 },
      { name: 'Mustang', make: makeMap['Ford'], startYear: 1964 },
      { name: 'Explorer', make: makeMap['Ford'], startYear: 1990 },
      { name: 'Escape', make: makeMap['Ford'], startYear: 2000 },
      
      // Chevrolet Models
      { name: 'Silverado', make: makeMap['Chevrolet'], startYear: 1999 },
      { name: 'Equinox', make: makeMap['Chevrolet'], startYear: 2004 },
      { name: 'Malibu', make: makeMap['Chevrolet'], startYear: 1964 },
      { name: 'Camaro', make: makeMap['Chevrolet'], startYear: 1967 },
      
      // BMW Models
      { name: '3 Series', make: makeMap['BMW'], startYear: 1975 },
      { name: '5 Series', make: makeMap['BMW'], startYear: 1972 },
      { name: 'X3', make: makeMap['BMW'], startYear: 2003 },
      { name: 'X5', make: makeMap['BMW'], startYear: 1999 },
      
      // Mercedes-Benz Models
      { name: 'C-Class', make: makeMap['Mercedes-Benz'], startYear: 1993 },
      { name: 'E-Class', make: makeMap['Mercedes-Benz'], startYear: 1953 },
      { name: 'GLC', make: makeMap['Mercedes-Benz'], startYear: 2015 },
      { name: 'S-Class', make: makeMap['Mercedes-Benz'], startYear: 1972 },
      
      // Audi Models
      { name: 'A4', make: makeMap['Audi'], startYear: 1994 },
      { name: 'A6', make: makeMap['Audi'], startYear: 1994 },
      { name: 'Q5', make: makeMap['Audi'], startYear: 2008 },
      { name: 'Q7', make: makeMap['Audi'], startYear: 2005 },
      
      // Volkswagen Models
      { name: 'Golf', make: makeMap['Volkswagen'], startYear: 1974 },
      { name: 'Jetta', make: makeMap['Volkswagen'], startYear: 1979 },
      { name: 'Passat', make: makeMap['Volkswagen'], startYear: 1973 },
      { name: 'Tiguan', make: makeMap['Volkswagen'], startYear: 2007 }
    ];
    
    // Insert models
    const createdModels = await Model.insertMany(models);
    
    console.log(`${createdModels.length} car models have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdModels;
  } catch (error) {
    console.error(`Error seeding car models: ${error.message}`);
    
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
  seedModels();
}

module.exports = seedModels; 