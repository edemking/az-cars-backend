const CarCondition = require('../models/cars/CarCondition');

const conditions = [
  { name: 'Surface Scratches', value: 'Scratched' },
  { name: 'Fresh Paint', value: 'Painted' },
  { name: 'Damage Present', value: 'Damaged' },
  { name: 'Smart Paint Repair', value: 'Smart Repaint' },
  { name: 'Repaired Component', value: 'Repaired' }
];

const seedCarConditions = async () => {
  try {
    await CarCondition.deleteMany({});
    console.log('Deleted existing car conditions');

    const createdConditions = await CarCondition.insertMany(conditions);
    console.log(`Seeded ${createdConditions.length} car conditions`);
  } catch (error) {
    console.error('Error seeding car conditions:', error);
  }
};

module.exports = seedCarConditions; 