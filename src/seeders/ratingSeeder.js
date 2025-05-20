const Rating = require('../models/cars/Rating');

const ratings = [
  { name: 'Excellent', value: 'Good' },
  { name: 'Standard', value: 'Average' },
  { name: 'Better than Average', value: 'Above Average' }
];

const seedRatings = async () => {
  try {
    await Rating.deleteMany({});
    console.log('Deleted existing ratings');

    const createdRatings = await Rating.insertMany(ratings);
    console.log(`Seeded ${createdRatings.length} ratings`);
  } catch (error) {
    console.error('Error seeding ratings:', error);
  }
};

module.exports = seedRatings; 