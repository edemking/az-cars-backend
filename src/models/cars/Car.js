const mongoose = require("mongoose");

// Import schemas from other model files
const Make = require("./Make");
const Model = require("./Model");
const FuelType = require("./FuelType");
const ServiceHistory = require("./ServiceHistory");
const BodyColor = require("./BodyColor");
const CarOption = require("./CarOption");
const Country = require("./Country");
const Rating = require("./Rating");
const CarCondition = require("./CarCondition");
const CarDrive = require("./CarDrive");
const VehicleType = require("./VehicleType");

// Reference the schemas from the imported models
const makeSchema = Make.schema;
const modelSchema = Model.schema;
const fuelTypeSchema = FuelType.schema;
const serviceHistorySchema = ServiceHistory.schema;
const bodyColorSchema = BodyColor.schema;
const carOptionsSchema = CarOption.schema;
const vehicleTypeSchema = VehicleType.schema;

// Define country schema (assuming it's not in a separate file)
const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
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

// Define component item schema that includes both rating and comment
const componentItemSchema = new mongoose.Schema(
  {
    rating: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Rating",
      required: false
    },
    comment: {
      type: String,
      required: false,
      maxlength: 500
    }
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

const carSchema = new mongoose.Schema({
  make: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Make",
    required: false,
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Model",
    required: false,
  },
  carDrive: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarDrive",
    required: false,
  },
  year: {
    type: Number,
    required: false,
  },
  price: {
    type: Number,
    required: false,
  },
  bodyColor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BodyColor",
    required: false,
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
    ref: "CarOption",
    required: false,
    default: null,
  },
  fuelType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FuelType",
    required: false,
  },
  cylinder: {
    type: Number,
    required: false,
    min: 1,
    max: 16,
  },
  serviceHistory: {
    type: Boolean,
    required: false,
    default: false,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: false,
  },
  warranty: {
    type: String,
    required: false,
  },
  engineSize: {
    type: Number,
    required: false,
  },
  transmission: {
    type: String,
    enum: ["Automatic", "Manual"],
    required: false,
  },
  vehicleType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VehicleType",
    required: false,
  },
  owner: {
    type: String,
    enum: [
      "First Owner",
      "Second Owner",
      "Third Owner",
      "Fourth Owner",
      "Fifth Owner",
      "Sixth Owner",
      "Seventh Owner",
      "Eighth Owner",
      "Ninth Owner",
      "Tenth Owner",
    ],
    required: false,
  },
  componentSummary: {
    windows: componentItemSchema,
    tires: componentItemSchema,
    brakes: componentItemSchema,
    battery: componentItemSchema,
    engine: componentItemSchema,
    transmission: componentItemSchema,
    suspension: componentItemSchema,
    body: componentItemSchema,
    interior: componentItemSchema,
    exterior: componentItemSchema,
    ac: componentItemSchema,
    electrical: componentItemSchema,
    centralLock: componentItemSchema,
    audio: componentItemSchema,
    navigation: componentItemSchema,
    seats: componentItemSchema,
    sunroof: componentItemSchema,
    paint: componentItemSchema,
    dashboard: componentItemSchema,
    lights: componentItemSchema,
    steering: componentItemSchema,
    exhaust: componentItemSchema,
    clutch: componentItemSchema,
  },
  interiorAndExterior: {
    frontBumber: { type: mongoose.Schema.Types.ObjectId, ref: "CarCondition" },
    bonnet: { type: mongoose.Schema.Types.ObjectId, ref: "CarCondition" },
    roof: { type: mongoose.Schema.Types.ObjectId, ref: "CarCondition" },
    reerBumber: { type: mongoose.Schema.Types.ObjectId, ref: "CarCondition" },
    driverSideFrontWing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    driverSideFrontDoor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    driverSideRearDoor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    driverRearQuarter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    passengerSideFrontWing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    passengerSideFrontDoor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    passengerSideRearDoor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    passengerRearQuarter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    driverSideFrontTyre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    driverSideRearTyre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    passengerSideFrontTyre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    passengerSideRearTyre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarCondition",
    },
    trunk: { type: mongoose.Schema.Types.ObjectId, ref: "CarCondition" },
    frontGlass: { type: mongoose.Schema.Types.ObjectId, ref: "CarCondition" },
    rearGlass: { type: mongoose.Schema.Types.ObjectId, ref: "CarCondition" },
    leftGlass: { type: mongoose.Schema.Types.ObjectId, ref: "CarCondition" },
    rightGlass: { type: mongoose.Schema.Types.ObjectId, ref: "CarCondition" },
    interior: {
      navigation: {
        type: Boolean,
        required: false,
      },
      sunroof: {
        type: Boolean,
        required: false,
      },
      seatType: {
        type: String,
        required: false,
      },
      interiorColor: {
        type: String,
        required: false,
      },
    },
  },
  images: {
    type: [String],
    default: [],
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  archivedAt: {
    type: Date,
    default: null,
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Car", carSchema);
