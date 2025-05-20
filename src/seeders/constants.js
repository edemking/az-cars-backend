const mongoose = require('mongoose');

// Helper function to create a fixed ObjectId with a valid hexadecimal string
const createId = (id) => mongoose.Types.ObjectId(id);

// Make IDs - using valid hexadecimal strings
const MAKES = {
  TOYOTA: createId('6470a9ae10b5d12345678901'),
  HONDA: createId('6470a9ae10b5d12345678902'),
  FORD: createId('6470a9ae10b5d12345678903'),
  CHEVROLET: createId('6470a9ae10b5d12345678904'),
  BMW: createId('6470a9ae10b5d12345678905'),
  MERCEDES: createId('6470a9ae10b5d12345678906'),
  AUDI: createId('6470a9ae10b5d12345678907'),
  VOLKSWAGEN: createId('6470a9ae10b5d12345678908')
};

// Model IDs
const MODELS = {
  CAMRY: createId('6470a9ae10b5d12345679001'),
  CIVIC: createId('6470a9ae10b5d12345679002'),
  F150: createId('6470a9ae10b5d12345679003'),
  EQUINOX: createId('6470a9ae10b5d12345679004'),
  THREE_SERIES: createId('6470a9ae10b5d12345679005'),
  C_CLASS: createId('6470a9ae10b5d12345679006'),
  A4: createId('6470a9ae10b5d12345679007'),
  GOLF: createId('6470a9ae10b5d12345679008')
};

// Car Drive IDs
const CAR_DRIVES = {
  FWD: createId('6470a9ae10b5d12345670001'),
  RWD: createId('6470a9ae10b5d12345670002'),
  AWD: createId('6470a9ae10b5d12345670003')
};

// Body Color IDs
const BODY_COLORS = {
  BLACK: createId('6470a9ae10b5d12345671001'),
  WHITE: createId('6470a9ae10b5d12345671002'),
  SILVER: createId('6470a9ae10b5d12345671003'),
  RED: createId('6470a9ae10b5d12345671004'),
  BLUE: createId('6470a9ae10b5d12345671005')
};

// Car Option IDs
const CAR_OPTIONS = {
  BASIC: createId('6470a9ae10b5d12345672001'),
  PREMIUM: createId('6470a9ae10b5d12345672002'),
  SPORT: createId('6470a9ae10b5d12345672003'),
  LUXURY: createId('6470a9ae10b5d12345672004')
};

// Fuel Type IDs
const FUEL_TYPES = {
  GASOLINE: createId('6470a9ae10b5d12345673001'),
  DIESEL: createId('6470a9ae10b5d12345673002'),
  HYBRID: createId('6470a9ae10b5d12345673003'),
  ELECTRIC: createId('6470a9ae10b5d12345673004')
};

// Cylinder IDs
const CYLINDERS = {
  THREE_CYL: createId('6470a9ae10b5d12345674001'),
  FOUR_CYL: createId('6470a9ae10b5d12345674002'),
  SIX_CYL: createId('6470a9ae10b5d12345674003'),
  EIGHT_CYL: createId('6470a9ae10b5d12345674004')
};

// Transmission IDs
const TRANSMISSIONS = {
  MANUAL_5: createId('6470a9ae10b5d12345675001'),
  MANUAL_6: createId('6470a9ae10b5d12345675002'),
  AUTO_6: createId('6470a9ae10b5d12345675003'),
  AUTO_8: createId('6470a9ae10b5d12345675004'),
  CVT: createId('6470a9ae10b5d12345675005')
};

// Country IDs
const COUNTRIES = {
  USA: createId('6470a9ae10b5d12345676001'),
  JAPAN: createId('6470a9ae10b5d12345676002'),
  GERMANY: createId('6470a9ae10b5d12345676003'),
  KOREA: createId('6470a9ae10b5d12345676004')
};

// Rating IDs
const RATINGS = {
  GOOD: createId('6470a9ae10b5d12345677001'),
  AVERAGE: createId('6470a9ae10b5d12345677002'),
  ABOVE_AVERAGE: createId('6470a9ae10b5d12345677003')
};

// Car Condition IDs
const CAR_CONDITIONS = {
  SCRATCHED: createId('6470a9ae10b5d12345678001'),
  PAINTED: createId('6470a9ae10b5d12345678002'),
  DAMAGED: createId('6470a9ae10b5d12345678003'),
  SMART_REPAINT: createId('6470a9ae10b5d12345678004'),
  REPAIRED: createId('6470a9ae10b5d12345678005')
};

module.exports = {
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
  CAR_CONDITIONS
}; 