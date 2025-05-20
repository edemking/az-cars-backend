const CarDrive = require('../models/cars/CarDrive');

const driveTypes = [
  { 
    name: 'Front Wheel Drive',
    type: 'FWD',
    description: 'Engine power is delivered to the front wheels'
  },
  {
    name: 'Rear Wheel Drive',
    type: 'RWD',
    description: 'Engine power is delivered to the rear wheels'
  },
  {
    name: 'All Wheel Drive',
    type: 'AWD',
    description: 'Engine power is delivered to all four wheels'
  }
];

const seedCarDrives = async () => {
  try {
    await CarDrive.deleteMany({});
    console.log('Deleted existing car drive types');

    const createdDrives = await CarDrive.insertMany(driveTypes);
    console.log(`Seeded ${createdDrives.length} car drive types`);
  } catch (error) {
    console.error('Error seeding car drive types:', error);
  }
};

module.exports = seedCarDrives; 