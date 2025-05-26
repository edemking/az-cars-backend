const mongoose = require('mongoose');
const Car = require('../models/cars/Car');
const connectDB = require('../config/db');
const {
  MAKES,
  MODELS,
  CAR_DRIVES,
  BODY_COLORS,
  CAR_OPTIONS,
  FUEL_TYPES,
  CYLINDERS,
  TRANSMISSIONS,
  COUNTRIES,
  RATINGS,
  CAR_CONDITIONS,
  VEHICLE_TYPES
} = require('./constants');

// Helper function to generate a random rating based on car age and mileage
const generateRating = (carYear, mileage) => {
  const carAge = new Date().getFullYear() - carYear;
  
  if (mileage < 15000 && carAge < 2) {
    // Newer cars with low mileage are more likely to be rated as Above Average
    const ratingOptions = ['Above Average', 'Above Average', 'Good', 'Good', 'Average'];
    return { rating: ratingOptions[Math.floor(Math.random() * ratingOptions.length)] };
  } else if (mileage < 50000 && carAge < 5) {
    // Mid-age cars are more likely to be Good
    const ratingOptions = ['Above Average', 'Good', 'Good', 'Good', 'Average'];
    return { rating: ratingOptions[Math.floor(Math.random() * ratingOptions.length)] };
  } else {
    // Older cars with higher mileage are more likely to be Average
    const ratingOptions = ['Good', 'Good', 'Average', 'Average', 'Average'];
    return { rating: ratingOptions[Math.floor(Math.random() * ratingOptions.length)] };
  }
};

// Generate component ratings for a car
const generateComponentSummary = (carYear, mileage) => {
  return {
    engine: generateRating(carYear, mileage),
    transmission: generateRating(carYear, mileage),
    suspension: generateRating(carYear, mileage),
    brakes: generateRating(carYear, mileage),
    exterior: generateRating(carYear, mileage),
    interior: generateRating(carYear, mileage),
    electrical: generateRating(carYear, mileage),
    safety: generateRating(carYear, mileage),
    performance: generateRating(carYear, mileage),
    comfort: generateRating(carYear, mileage)
  };
};

const cars = [
  {
    _id: new mongoose.Types.ObjectId('6470a9ae10b5d12345690001'),
    make: MAKES.TOYOTA,
    model: MODELS.CAMRY,
    carDrive: CAR_DRIVES.FWD,
    vehicleType: VEHICLE_TYPES.SEDAN,
    year: 2020,
    price: 25000,
    bodyColor: BODY_COLORS.SILVER,
    mileage: 15000,
    description: 'Well-maintained Toyota Camry with low mileage',
    numberOfKeys: 2,
    carOptions: CAR_OPTIONS.PREMIUM,
    fuelType: FUEL_TYPES.GASOLINE,
    cylinder: CYLINDERS.FOUR_CYL,
    serviceHistory: new mongoose.Types.ObjectId('6470a9ae10b5d12345680001'),
    country: COUNTRIES.JAPAN,
    warranty: true,
    engineSize: 2.5,
    transmission: TRANSMISSIONS.AUTO_8,
    type: "FWD",
    firstOwner: true,
    componentSummary: {
      engine: RATINGS.GOOD,
      steering: RATINGS.GOOD,
      centralLock: RATINGS.GOOD,
      centralLocking: RATINGS.GOOD,
      interiorButtons: RATINGS.GOOD,
      gearbox: RATINGS.GOOD,
      dashLight: RATINGS.GOOD,
      audioSystem: RATINGS.GOOD,
      windowControl: RATINGS.GOOD,
      electricComponents: RATINGS.GOOD,
      acHeating: RATINGS.GOOD,
      dashboard: RATINGS.GOOD,
      roof: RATINGS.GOOD,
      breaks: RATINGS.GOOD,
      suspension: RATINGS.GOOD,
      gloveBox: RATINGS.GOOD,
      frontSeats: RATINGS.GOOD,
      exhaust: RATINGS.GOOD,
      clutch: RATINGS.GOOD,
      backSeat: RATINGS.GOOD,
      driveTrain: RATINGS.GOOD
    },
    interiorAndExterior: {
      frontBumber: CAR_CONDITIONS.PAINTED,
      bonnet: CAR_CONDITIONS.PAINTED,
      roof: CAR_CONDITIONS.PAINTED,
      reerBumber: CAR_CONDITIONS.PAINTED,
      driverSideFrontWing: CAR_CONDITIONS.PAINTED,
      driverSideFrontDoor: CAR_CONDITIONS.PAINTED,
      driverSideRearDoor: CAR_CONDITIONS.PAINTED,
      driverRearQuarter: CAR_CONDITIONS.PAINTED,
      passengerSideFrontWing: CAR_CONDITIONS.PAINTED,
      passengerSideFrontDoor: CAR_CONDITIONS.PAINTED,
      passengerSideRearDoor: CAR_CONDITIONS.PAINTED,
      passengerRearQuarter: CAR_CONDITIONS.PAINTED,
      driverSideFrontTyre: CAR_CONDITIONS.PAINTED,
      driverSideRearTyre: CAR_CONDITIONS.PAINTED,
      passengerSideFrontTyre: CAR_CONDITIONS.PAINTED,
      passengerSideRearTyre: CAR_CONDITIONS.PAINTED,
      trunk: CAR_CONDITIONS.PAINTED,
      frontGlass: CAR_CONDITIONS.PAINTED,
      rearGlass: CAR_CONDITIONS.PAINTED,
      leftGlass: CAR_CONDITIONS.PAINTED,
      rightGlass: CAR_CONDITIONS.PAINTED
    }
  },
  {
    _id: new mongoose.Types.ObjectId('6470a9ae10b5d12345690002'),
    make: MAKES.HONDA,
    model: MODELS.CIVIC,
    carDrive: CAR_DRIVES.FWD,
    vehicleType: VEHICLE_TYPES.SEDAN,
    year: 2019,
    price: 22000,
    bodyColor: BODY_COLORS.BLUE,
    mileage: 20000,
    description: 'Honda Civic in excellent condition',
    numberOfKeys: 2,
    carOptions: CAR_OPTIONS.SPORT,
    fuelType: FUEL_TYPES.GASOLINE,
    cylinder: CYLINDERS.FOUR_CYL,
    serviceHistory: new mongoose.Types.ObjectId('6470a9ae10b5d12345680002'),
    country: COUNTRIES.JAPAN,
    warranty: true,
    engineSize: 1.5,
    transmission: TRANSMISSIONS.CVT,
    type: "FWD",
    firstOwner: true,
    componentSummary: {
      engine: RATINGS.GOOD,
      steering: RATINGS.GOOD,
      centralLock: RATINGS.GOOD,
      centralLocking: RATINGS.GOOD,
      interiorButtons: RATINGS.GOOD,
      gearbox: RATINGS.GOOD,
      dashLight: RATINGS.GOOD,
      audioSystem: RATINGS.GOOD,
      windowControl: RATINGS.GOOD,
      electricComponents: RATINGS.GOOD,
      acHeating: RATINGS.GOOD,
      dashboard: RATINGS.GOOD,
      roof: RATINGS.GOOD,
      breaks: RATINGS.GOOD,
      suspension: RATINGS.GOOD,
      gloveBox: RATINGS.GOOD,
      frontSeats: RATINGS.GOOD,
      exhaust: RATINGS.GOOD,
      clutch: RATINGS.GOOD,
      backSeat: RATINGS.GOOD,
      driveTrain: RATINGS.GOOD
    },
    interiorAndExterior: {
      frontBumber: CAR_CONDITIONS.PAINTED,
      bonnet: CAR_CONDITIONS.PAINTED,
      roof: CAR_CONDITIONS.PAINTED,
      reerBumber: CAR_CONDITIONS.PAINTED,
      driverSideFrontWing: CAR_CONDITIONS.PAINTED,
      driverSideFrontDoor: CAR_CONDITIONS.PAINTED,
      driverSideRearDoor: CAR_CONDITIONS.PAINTED,
      driverRearQuarter: CAR_CONDITIONS.PAINTED,
      passengerSideFrontWing: CAR_CONDITIONS.PAINTED,
      passengerSideFrontDoor: CAR_CONDITIONS.PAINTED,
      passengerSideRearDoor: CAR_CONDITIONS.PAINTED,
      passengerRearQuarter: CAR_CONDITIONS.PAINTED,
      driverSideFrontTyre: CAR_CONDITIONS.PAINTED,
      driverSideRearTyre: CAR_CONDITIONS.PAINTED,
      passengerSideFrontTyre: CAR_CONDITIONS.PAINTED,
      passengerSideRearTyre: CAR_CONDITIONS.PAINTED,
      trunk: CAR_CONDITIONS.PAINTED,
      frontGlass: CAR_CONDITIONS.PAINTED,
      rearGlass: CAR_CONDITIONS.PAINTED,
      leftGlass: CAR_CONDITIONS.PAINTED,
      rightGlass: CAR_CONDITIONS.PAINTED
    }
  }
];

const seedCars = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Car.deleteMany({});
    
    // Insert new data
    const createdCars = await Car.insertMany(cars);
    
    console.log(`${createdCars.length} cars have been seeded.`);
    
    // If running this file directly
    if (require.main === module) {
      mongoose.connection.close();
      console.log('Database connection closed.');
    }
    
    return createdCars;
  } catch (error) {
    console.error(`Error seeding cars: ${error.message}`);
    
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
  seedCars();
}

module.exports = seedCars; 