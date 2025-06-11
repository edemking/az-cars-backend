const mongoose = require('mongoose');
const BodyColor = require('../models/cars/BodyColor');
const connectDB = require('../config/db');

const bodyColors = [
  {
    name: 'Black',
    hexCode: '#000000',
    type: 'Solid'
  },
  {
    name: 'White',
    hexCode: '#FFFFFF',
    type: 'Solid'
  },
  {
    name: 'Silver',
    hexCode: '#C0C0C0',
    type: 'Metallic'
  },
  {
    name: 'Gray',
    hexCode: '#808080',
    type: 'Metallic'
  },
  {
    name: 'Red',
    hexCode: '#FF0000',
    type: 'Solid'
  },
  {
    name: 'Blue',
    hexCode: '#0000FF',
    type: 'Metallic'
  },
  {
    name: 'Green',
    hexCode: '#008000',
    type: 'Metallic'
  },
  {
    name: 'Yellow',
    hexCode: '#FFFF00',
    type: 'Solid'
  },
  {
    name: 'Orange',
    hexCode: '#FFA500',
    type: 'Solid'
  },
  {
    name: 'Brown',
    hexCode: '#A52A2A',
    type: 'Metallic'
  },
  {
    name: 'Burgundy',
    hexCode: '#800020',
    type: 'Metallic'
  },
  {
    name: 'Navy Blue',
    hexCode: '#000080',
    type: 'Metallic'
  },
  {
    name: 'Pearl White',
    hexCode: '#F5F5F5',
    type: 'Pearlescent'
  },
  {
    name: 'Champagne',
    hexCode: '#F7E7CE',
    type: 'Metallic'
  },
  {
    name: 'Matte Black',
    hexCode: '#121212',
    type: 'Matte'
  },
  {
    name: 'Gunmetal Gray',
    hexCode: '#2C3539',
    type: 'Metallic'
  },
  {
    name: 'Racing Green',
    hexCode: '#004225',
    type: 'Metallic'
  },
  {
    name: 'Electric Blue',
    hexCode: '#7DF9FF',
    type: 'Metallic'
  },
  {
    name: 'Beige',
    hexCode: '#F5F5DC',
    type: 'Solid'
  }
];

const seedBodyColors = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await BodyColor.deleteMany({});
    
    // Insert new data
    const createdBodyColors = await BodyColor.insertMany(bodyColors);
    
    console.log(`${createdBodyColors.length} body colors have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdBodyColors;
  } catch (error) {
    console.error(`Error seeding body colors: ${error.message}`);
    
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
  seedBodyColors();
}

module.exports = seedBodyColors; 