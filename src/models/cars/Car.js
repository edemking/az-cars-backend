const mongoose = require("mongoose");

// Import schemas from other model files
const Make = require("./Make");
const Model = require("./Model");
const FuelType = require("./FuelType");
const Cylinder = require("./Cylinder");
const ServiceHistory = require("./ServiceHistory");
const BodyColor = require("./BodyColor");
const CarOption = require("./CarOption");
const Transmission = require("./Transmission");
const Country = require("./Country");
const Rating = require("./Rating");
const CarCondition = require("./CarCondition");
const CarDrive = require("./CarDrive");

// Reference the schemas from the imported models
const makeSchema = Make.schema;
const modelSchema = Model.schema;
const fuelTypeSchema = FuelType.schema;
const cylinderSchema = Cylinder.schema;
const serviceHistorySchema = ServiceHistory.schema;
const bodyColorSchema = BodyColor.schema;
const carOptionsSchema = CarOption.schema;
const transmissionSchema = Transmission.schema;

// Define country schema (assuming it's not in a separate file)
const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    }
  },
  { _id: false }
);

// Define rating schema for component ratings
const ratingSchema = new mongoose.Schema(
  {
    rating: {
      type: String,
      enum: ["Good", "Average", "Above Average"],
      required: true,
    },
  },
  { _id: false }
);

const interiorAndExteriorSchema = new mongoose.Schema(
  {
    condition: {
      type: String,
      enum: ["Scratched", "Painted", "Damaged", "Smart Repaint", "Repaired"],
      required: true,
    },
  },
  { _id: false }
);

const carDriveSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["FWD", "RWD", "AWD"],
    required: true,
  },
});

const carSchema = new mongoose.Schema({
  make: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Make',
    required: true
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Model',
    required: true
  },
  carDrive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarDrive',
    required: true
  },
  year: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  bodyColor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BodyColor',
    required: true
  },
  mileage: {
    type: Number,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  numberOfKeys: {
    type: Number,
    required: false,
  },
  carOptions: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarOption',
    required: true
  },
  fuelType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FuelType',
    required: true
  },
  cylinder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cylinder',
    required: true
  },
  serviceHistory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceHistory',
    required: true
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true
  },
  warranty: {
    type: Boolean,
    required: false,
  },
  engineSize: {
    type: Number,
    required: false,
  },
  transmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transmission',
    required: true
  },
  firstOwner: {
    type: Boolean,
    required: false,
  },
  componentSummary: {
    engine: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    steering: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    centralLock: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    centralLocking: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    interiorButtons: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    gearbox: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    dashLight: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    audioSystem: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    windowControl: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    electricComponents: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    acHeating: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    dashboard: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    roof: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    breaks: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    suspension: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    gloveBox: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    frontSeats: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    exhaust: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    clutch: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    backSeat: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
    driveTrain: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }
  },
  interiorAndExterior: {
    frontBumber: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    bonnet: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    roof: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    reerBumber: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    driverSideFrontWing: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    driverSideFrontDoor: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    driverSideRearDoor: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    driverRearQuarter: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    passengerSideFrontWing: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    passengerSideFrontDoor: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    passengerSideRearDoor: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    passengerRearQuarter: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    driverSideFrontTyre: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    driverSideRearTyre: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    passengerSideFrontTyre: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    passengerSideRearTyre: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    trunk: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    frontGlass: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    rearGlass: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    leftGlass: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' },
    rightGlass: { type: mongoose.Schema.Types.ObjectId, ref: 'CarCondition' }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Car", carSchema);
