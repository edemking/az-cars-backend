const mongoose = require('mongoose');
const CarOption = require('../models/cars/CarOption');
const connectDB = require('../config/db');

const carOptions = [
  // Safety options
  {
    name: 'ABS',
    category: 'Safety',
    description: 'Anti-lock Braking System'
  },
  {
    name: 'Airbags',
    category: 'Safety',
    description: 'Driver and passenger airbags'
  },
  {
    name: 'Lane Departure Warning',
    category: 'Safety',
    description: 'Alerts when vehicle is drifting out of lane'
  },
  {
    name: 'Blind Spot Detection',
    category: 'Safety',
    description: 'Monitors blind spots and alerts driver'
  },
  {
    name: 'Adaptive Cruise Control',
    category: 'Safety',
    description: 'Automatically adjusts speed to maintain safe distance'
  },
  {
    name: 'Parking Sensors',
    category: 'Safety',
    description: 'Sensors that help with parking'
  },
  
  // Entertainment options
  {
    name: 'Navigation System',
    category: 'Entertainment',
    description: 'Built-in GPS navigation'
  },
  {
    name: 'Premium Sound System',
    category: 'Entertainment',
    description: 'High-quality audio system'
  },
  {
    name: 'Bluetooth Connectivity',
    category: 'Entertainment',
    description: 'Wireless connectivity for phones and devices'
  },
  {
    name: 'Touchscreen Display',
    category: 'Entertainment',
    description: 'Interactive touchscreen interface'
  },
  {
    name: 'Apple CarPlay/Android Auto',
    category: 'Entertainment',
    description: 'Smartphone integration'
  },
  {
    name: 'Rear Seat Entertainment',
    category: 'Entertainment',
    description: 'Entertainment system for rear passengers'
  },
  
  // Comfort options
  {
    name: 'Heated Seats',
    category: 'Comfort',
    description: 'Seats with heating functionality'
  },
  {
    name: 'Ventilated Seats',
    category: 'Comfort',
    description: 'Seats with cooling functionality'
  },
  {
    name: 'Leather Upholstery',
    category: 'Comfort',
    description: 'Leather seat material'
  },
  {
    name: 'Power Seats',
    category: 'Comfort',
    description: 'Electrically adjustable seats'
  },
  {
    name: 'Climate Control',
    category: 'Comfort',
    description: 'Automatic temperature control'
  },
  {
    name: 'Sunroof/Moonroof',
    category: 'Comfort',
    description: 'Opening roof panel'
  },
  
  // Performance options
  {
    name: 'Turbocharger',
    category: 'Performance',
    description: 'Forced induction system to increase power'
  },
  {
    name: 'Sport Suspension',
    category: 'Performance',
    description: 'Enhanced suspension for better handling'
  },
  {
    name: 'All-Wheel Drive',
    category: 'Performance',
    description: 'Power delivered to all wheels'
  },
  {
    name: 'Performance Tires',
    category: 'Performance',
    description: 'High-performance tires for better grip'
  },
  
  // Exterior options
  {
    name: 'Alloy Wheels',
    category: 'Exterior',
    description: 'Lightweight alloy wheel rims'
  },
  {
    name: 'Panoramic Roof',
    category: 'Exterior',
    description: 'Large glass roof panel'
  },
  {
    name: 'LED Headlights',
    category: 'Exterior',
    description: 'Energy-efficient LED lighting'
  },
  {
    name: 'Roof Rails',
    category: 'Exterior',
    description: 'Rails for mounting cargo on roof'
  },
  
  // Interior options
  {
    name: 'Ambient Lighting',
    category: 'Interior',
    description: 'Customizable interior lighting'
  },
  {
    name: 'Digital Dashboard',
    category: 'Interior',
    description: 'Digital instrument cluster'
  },
  {
    name: 'Wireless Charging',
    category: 'Interior',
    description: 'Wireless device charging pad'
  },
  {
    name: 'Head-up Display',
    category: 'Interior',
    description: 'Projects information onto windshield'
  }
];

const seedCarOptions = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await CarOption.deleteMany({});
    
    // Insert new data
    const createdCarOptions = await CarOption.insertMany(carOptions);
    
    console.log(`${createdCarOptions.length} car options have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdCarOptions;
  } catch (error) {
    console.error(`Error seeding car options: ${error.message}`);
    
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
  seedCarOptions();
}

module.exports = seedCarOptions; 