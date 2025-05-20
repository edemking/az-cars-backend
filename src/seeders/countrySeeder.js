const Country = require('../models/cars/Country');

const countries = [
  { name: 'Japan' },
  { name: 'Germany' },
  { name: 'United States' },
  { name: 'South Korea' },
  { name: 'United Kingdom' },
  { name: 'Italy' },
  { name: 'France' },
  { name: 'Sweden' }
];

const seedCountries = async () => {
  try {
    await Country.deleteMany({});
    console.log('Deleted existing countries');

    const createdCountries = await Country.insertMany(countries);
    console.log(`Seeded ${createdCountries.length} countries`);
  } catch (error) {
    console.error('Error seeding countries:', error);
  }
};

module.exports = seedCountries; 