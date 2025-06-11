const fs = require('fs');
const path = require('path');
const makes = require('./data/makes.json');

console.log('Original makes:', makes.length);

// Remove duplicates based on name
const uniqueMakes = makes.filter((make, index, self) => 
  index === self.findIndex((m) => m.name === make.name)
);

console.log('After removing duplicates:', uniqueMakes.length);
console.log('Duplicates found:', makes.length - uniqueMakes.length);

// Write back the deduplicated makes
fs.writeFileSync(path.join(__dirname, 'data', 'makes.json'), JSON.stringify(uniqueMakes, null, 2));
console.log('Duplicates removed from makes.json'); 