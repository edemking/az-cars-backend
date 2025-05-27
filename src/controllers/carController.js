const Car = require("../models/cars/Car");
const { getFileUrl, getFileUrls } = require("../utils/fileUpload");
const fs = require("fs");
const path = require("path");
const Make = require("../models/cars/Make");
const Model = require("../models/cars/Model");
const CarDrive = require("../models/cars/CarDrive");
const BodyColor = require("../models/cars/BodyColor");
const CarOption = require("../models/cars/CarOption");
const FuelType = require("../models/cars/FuelType");
const Cylinder = require("../models/cars/Cylinder");
const ServiceHistory = require("../models/cars/ServiceHistory");
const Country = require("../models/cars/Country");
const Transmission = require("../models/cars/Transmission");
const EngineSize = require("../models/cars/EngineSize");
const VehicleType = require("../models/cars/VehicleType");
const Rating = require("../models/cars/Rating");
const CarCondition = require("../models/cars/CarCondition");
const { sendSuccess, sendError } = require("../utils/responseHandler");

// Helper function to validate and preprocess car data
const validateCarData = async (carData) => {
  const errors = [];
  const warnings = [];

  // Define optional ObjectId fields (no longer required)
  const objectIdFields = [
    'make', 'model', 'carDrive', 'bodyColor', 'carOptions', 
    'fuelType', 'cylinder', 'country', 'transmission', 'vehicleType'
  ];

  // Convert empty strings to null for ObjectId fields and validate format
  objectIdFields.forEach(field => {
    if (carData[field] === '' || carData[field] === 'null' || carData[field] === 'undefined') {
      carData[field] = null;
    } else if (carData[field] && typeof carData[field] === 'string' && carData[field].length !== 24) {
      errors.push(`${field} must be a valid ObjectId (24 characters), received: "${carData[field]}" (${carData[field].length} characters)`);
    }
  });

  // Handle serviceHistory as boolean
  if (carData.serviceHistory !== undefined) {
    if (typeof carData.serviceHistory === 'string') {
      if (carData.serviceHistory.toLowerCase() === 'true') {
        carData.serviceHistory = true;
      } else if (carData.serviceHistory.toLowerCase() === 'false') {
        carData.serviceHistory = false;
      } else {
        errors.push(`serviceHistory must be a boolean (true/false), received: "${carData.serviceHistory}"`);
      }
    } else if (typeof carData.serviceHistory !== 'boolean') {
      errors.push(`serviceHistory must be a boolean, received: ${typeof carData.serviceHistory}`);
    }
  }

  // Optional validation for data types
  if (carData.year && (typeof carData.year !== 'number' || carData.year < 1900 || carData.year > new Date().getFullYear() + 1)) {
    errors.push(`year must be a valid number between 1900 and ${new Date().getFullYear() + 1}`);
  }

  if (carData.price && (typeof carData.price !== 'number' || carData.price < 0)) {
    errors.push('price must be a positive number');
  }

  if (carData.mileage && (typeof carData.mileage !== 'number' || carData.mileage < 0)) {
    errors.push('mileage must be a positive number');
  }

  if (carData.numberOfKeys && (typeof carData.numberOfKeys !== 'number' || carData.numberOfKeys < 0)) {
    errors.push('numberOfKeys must be a positive number');
  }

  if (carData.engineSize && (typeof carData.engineSize !== 'number' || carData.engineSize < 0)) {
    errors.push('engineSize must be a positive number');
  }

  return { isValid: errors.length === 0, errors, warnings, processedData: carData };
};

// Get all cars
exports.getCars = async (req, res) => {
  try {
    // Add filter to exclude archived cars by default unless explicitly requested
    const filter = {};
    if (req.query.includeArchived !== 'true') {
      filter.isArchived = false;
    }
    
    // Allow filtering by approval status
    if (req.query.approved === 'true') {
      filter.isApproved = true;
    } else if (req.query.approved === 'false') {
      filter.isApproved = false;
    }
    
    const cars = await Car.find(filter)
      .populate("make")
      .populate("model")
      .populate("carDrive")
      .populate("bodyColor")
      .populate("carOptions")
      .populate("fuelType")
      .populate("cylinder")
      .populate("country")
      .populate("transmission")
      .populate("vehicleType")
      .populate({
        path: "componentSummary",
        populate: {
          path: "engine steering centralLock centralLocking interiorButtons gearbox dashLight audioSystem windowControl electricComponents acHeating dashboard roof breaks suspension gloveBox frontSeats exhaust clutch backSeat driveTrain",
          model: "Rating",
        },
      })
      .populate({
        path: "interiorAndExterior",
        populate: {
          path: "frontBumber bonnet roof reerBumber driverSideFrontWing driverSideFrontDoor driverSideRearDoor driverRearQuarter passengerSideFrontWing passengerSideFrontDoor passengerSideRearDoor passengerRearQuarter driverSideFrontTyre driverSideRearTyre passengerSideFrontTyre passengerSideRearTyre trunk frontGlass rearGlass leftGlass rightGlass",
          model: "CarCondition",
        },
      })
      .populate("approvedBy", "name email")
      .populate("archivedBy", "name email");
      
    sendSuccess(res, { data: cars });
  } catch (error) {
    sendError(res, { message: error.message });
  }
};

// Get single car
exports.getCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)
      .populate("make")
      .populate("model")
      .populate("carDrive")
      .populate("bodyColor")
      .populate("carOptions")
      .populate("fuelType")
      .populate("cylinder")
      .populate("country")
      .populate("transmission")
      .populate("vehicleType")
      .populate({
        path: "componentSummary",
        populate: {
          path: "engine steering centralLock centralLocking interiorButtons gearbox dashLight audioSystem windowControl electricComponents acHeating dashboard roof breaks suspension gloveBox frontSeats exhaust clutch backSeat driveTrain",
          model: "Rating",
        },
      })
      .populate({
        path: "interiorAndExterior",
        populate: {
          path: "frontBumber bonnet roof reerBumber driverSideFrontWing driverSideFrontDoor driverSideRearDoor driverRearQuarter passengerSideFrontWing passengerSideFrontDoor passengerSideRearDoor passengerRearQuarter driverSideFrontTyre driverSideRearTyre passengerSideFrontTyre passengerSideRearTyre trunk frontGlass rearGlass leftGlass rightGlass",
          model: "CarCondition",
        },
      });

    if (!car) {
      return sendError(res, {
        statusCode: 404,
        message: "Car not found",
      });
    }
    sendSuccess(res, { data: car });
  } catch (error) {
    sendError(res, { message: error.message });
  }
};

// Create car
exports.createCar = async (req, res) => {
  try {
    // Parse form data fields that contain JSON strings
    const carData = { ...req.body };

    // Data preprocessing and validation
    const { isValid, errors, warnings, processedData } = await validateCarData(carData);

    if (!isValid) {
      return sendError(res, {
        statusCode: 400,
        message: "Invalid car data",
        errors: errors,
        warnings: warnings,
      });
    }

    // Parse nested objects from form data with better error handling
    if (processedData.componentSummary) {
      try {
        let parsedSummary;

        // Parse if it's a string, otherwise use as is
        if (typeof processedData.componentSummary === "string") {
          parsedSummary = JSON.parse(processedData.componentSummary);
        } else {
          parsedSummary = processedData.componentSummary;
        }

        // Clean and validate each field in componentSummary
        const cleanedSummary = {};
        const fields = [
          "engine",
          "steering",
          "centralLock",
          "centralLocking",
          "interiorButtons",
          "gearbox",
          "dashLight",
          "audioSystem",
          "windowControl",
          "electricComponents",
          "acHeating",
          "dashboard",
          "roof",
          "breaks",
          "suspension",
          "gloveBox",
          "frontSeats",
          "exhaust",
          "clutch",
          "backSeat",
          "driveTrain",
        ];

        fields.forEach((field) => {
          if (parsedSummary[field]) {
            // Handle empty strings or invalid values
            if (parsedSummary[field] === "" || parsedSummary[field] === "null") {
              // Skip empty values - they're optional
              return;
            }
            cleanedSummary[field] = parsedSummary[field];
          }
        });

        processedData.componentSummary = cleanedSummary;
      } catch (e) {
        console.error("Error parsing componentSummary:", e);
        return sendError(res, {
          statusCode: 400,
          message: "Invalid componentSummary format",
          errors: {
            details: e.message,
            received:
              typeof processedData.componentSummary === "string"
                ? processedData.componentSummary.substring(0, 100) + "..."
                : typeof processedData.componentSummary,
          },
        });
      }
    }

    if (processedData.interiorAndExterior) {
      try {
        // First check if it's already an object
        if (typeof processedData.interiorAndExterior === "object") {
          // If it's already an object, use it as is
          console.log("interiorAndExterior is already an object");
        } else {
          // Try to parse it as JSON
          const parsed = JSON.parse(processedData.interiorAndExterior);
          if (typeof parsed !== "object") {
            throw new Error("interiorAndExterior must be an object");
          }
          processedData.interiorAndExterior = parsed;
        }
      } catch (e) {
        console.error("Error parsing interiorAndExterior:", e);
        return sendError(res, {
          statusCode: 400,
          message: "Invalid interiorAndExterior format",
          errors: {
            details: e.message,
            received:
              typeof processedData.interiorAndExterior === "string"
                ? processedData.interiorAndExterior.substring(0, 100) + "..."
                : typeof processedData.interiorAndExterior,
          },
        });
      }
    }

    // Handle image uploads if present
    if (req.files && req.files.images) {
      processedData.images = req.files.images.map((file) => getFileUrl(req, file));
    }

    // Log the processed data before saving
    console.log("Processed car data:", {
      ...processedData,
      componentSummary: processedData.componentSummary
        ? "Present (cleaned)"
        : "Not present",
      interiorAndExterior: processedData.interiorAndExterior
        ? "Present (parsed)"
        : "Not present",
      images: processedData.images ? `${processedData.images.length} images` : "No images",
    });

    const car = new Car(processedData);
    const newCar = await car.save();

    // Populate references before sending response
    const populatedCar = await Car.findById(newCar._id)
      .populate("make")
      .populate("model")
      .populate("carDrive")
      .populate("bodyColor")
      .populate("carOptions")
      .populate("fuelType")
      .populate("cylinder")
      .populate("country")
      .populate("transmission")
      .populate("vehicleType")
      .populate({
        path: "componentSummary",
        populate: {
          path: "engine steering centralLock centralLocking interiorButtons gearbox dashLight audioSystem windowControl electricComponents acHeating dashboard roof breaks suspension gloveBox frontSeats exhaust clutch backSeat driveTrain",
          model: "Rating",
        },
      })
      .populate({
        path: "interiorAndExterior",
        populate: {
          path: "frontBumber bonnet roof reerBumber driverSideFrontWing driverSideFrontDoor driverSideRearDoor driverRearQuarter passengerSideFrontWing passengerSideFrontDoor passengerSideRearDoor passengerRearQuarter driverSideFrontTyre driverSideRearTyre passengerSideFrontTyre passengerSideRearTyre trunk frontGlass rearGlass leftGlass rightGlass",
          model: "CarCondition",
        },
      });

    sendSuccess(res, {
      statusCode: 201,
      message: "Car created successfully",
      data: populatedCar,
    });
  } catch (error) {
    console.error("Error creating car:", error);
    sendError(res, {
      statusCode: 400,
      message: "Error creating car",
      errors: {
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
  }
};

// Update car
exports.updateCar = async (req, res) => {
  try {
    const updates = req.body;

    // Handle image uploads if present
    if (req.files && req.files.images) {
      const newImages = req.files.images.map((file) => getFileUrl(req, file));

      // If we want to append to existing images
      if (updates.appendImages === "true") {
        const existingCar = await Car.findById(req.params.id);
        if (existingCar) {
          updates.images = [...existingCar.images, ...newImages];
        } else {
          updates.images = newImages;
        }
      } else {
        // Replace existing images
        updates.images = newImages;
      }

      // Remove appendImages from updates as it's not part of the model
      delete updates.appendImages;
    }

    const car = await Car.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!car) {
      return sendError(res, {
        statusCode: 404,
        message: "Car not found",
      });
    }

    sendSuccess(res, {
      message: "Car updated successfully",
      data: car,
    });
  } catch (error) {
    sendError(res, {
      statusCode: 400,
      message: error.message,
    });
  }
};

// Delete car
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return sendError(res, {
        statusCode: 404,
        message: "Car not found",
      });
    }
    sendSuccess(res, { message: "Car deleted successfully" });
  } catch (error) {
    sendError(res, { message: error.message });
  }
};

// Upload car images
exports.uploadCarImages = async (req, res) => {
  try {
    if (!req.files || !req.files.images) {
      return sendError(res, {
        statusCode: 400,
        message: "No images uploaded",
      });
    }

    const carId = req.params.id;
    const car = await Car.findById(carId);

    if (!car) {
      return sendError(res, {
        statusCode: 404,
        message: "Car not found",
      });
    }

    // Get URLs for the uploaded images
    const imageUrls = req.files.images.map((file) => getFileUrl(req, file));

    // Update car with new images
    if (req.body.replace === "true") {
      // Replace all images
      car.images = imageUrls;
    } else {
      // Append to existing images
      car.images = [...car.images, ...imageUrls];
    }

    await car.save();

    sendSuccess(res, {
      message: "Images uploaded successfully",
      data: { images: car.images },
    });
  } catch (error) {
    sendError(res, {
      statusCode: 400,
      message: error.message,
    });
  }
};

// Delete car image
exports.deleteCarImage = async (req, res) => {
  try {
    const { id, imageUrl } = req.params;

    const car = await Car.findById(id);
    if (!car) {
      return sendError(res, {
        statusCode: 404,
        message: "Car not found",
      });
    }

    // Remove the image URL from the car's images array
    car.images = car.images.filter(
      (img) => img !== decodeURIComponent(imageUrl)
    );

    await car.save();

    // Optionally, delete the actual file from the server
    // This would require parsing the URL to get the file path

    sendSuccess(res, {
      message: "Image deleted successfully",
      data: { images: car.images },
    });
  } catch (error) {
    sendError(res, {
      statusCode: 400,
      message: error.message,
    });
  }
};

// Get all reference data for creating a car
exports.getReferenceData = async (req, res) => {
  try {
    const [
      makes,
      models,
      carDrives,
      bodyColors,
      carOptions,
      fuelTypes,
      cylinders,
      serviceHistories,
      countries,
      transmissions,
      engineSizes,
      vehicleTypes,
      ratings,
      carConditions,
    ] = await Promise.all([
      Make.find(),
      Model.find().populate("make"),
      CarDrive.find(),
      BodyColor.find(),
      CarOption.find(),
      FuelType.find(),
      Cylinder.find(),
      ServiceHistory.find(),
      Country.find(),
      Transmission.find(),
      EngineSize.find(),
      VehicleType.find(),
      Rating.find(),
      CarCondition.find(),
    ]);

    sendSuccess(res, {
      data: {
        makes,
        models,
        carDrives,
        bodyColors,
        carOptions,
        fuelTypes,
        cylinders,
        serviceHistories,
        countries,
        transmissions,
        engineSizes,
        vehicleTypes,
        ratings,
        carConditions,
      },
    });
  } catch (error) {
    sendError(res, { message: error.message });
  }
};

// Approve car
exports.approveCar = async (req, res) => {
  try {
    const carId = req.params.id;
    
    const car = await Car.findById(carId);
    
    if (!car) {
      return sendError(res, {
        statusCode: 404,
        message: "Car not found",
      });
    }
    
    // Update the car with approval information
    car.isApproved = true;
    car.approvedAt = Date.now();
    car.approvedBy = req.user.id;
    
    await car.save();
    
    // Fetch the updated car with populated fields
    const updatedCar = await Car.findById(carId)
      .populate("approvedBy", "name email");
    
    sendSuccess(res, {
      message: "Car approved successfully",
      data: updatedCar,
    });
  } catch (error) {
    sendError(res, {
      statusCode: 400,
      message: error.message,
    });
  }
};

// Reject car approval
exports.rejectCar = async (req, res) => {
  try {
    const carId = req.params.id;
    
    const car = await Car.findById(carId);
    
    if (!car) {
      return sendError(res, {
        statusCode: 404,
        message: "Car not found",
      });
    }
    
    // Update the car to remove approval
    car.isApproved = false;
    car.approvedAt = null;
    car.approvedBy = null;
    
    await car.save();
    
    sendSuccess(res, {
      message: "Car approval rejected successfully",
      data: car,
    });
  } catch (error) {
    sendError(res, {
      statusCode: 400,
      message: error.message,
    });
  }
};

// Archive car
exports.archiveCar = async (req, res) => {
  try {
    const carId = req.params.id;
    
    const car = await Car.findById(carId);
    
    if (!car) {
      return sendError(res, {
        statusCode: 404,
        message: "Car not found",
      });
    }
    
    // Update the car with archive information
    car.isArchived = true;
    car.archivedAt = Date.now();
    car.archivedBy = req.user.id;
    
    await car.save();
    
    // Fetch the updated car with populated fields
    const updatedCar = await Car.findById(carId)
      .populate("archivedBy", "name email");
    
    sendSuccess(res, {
      message: "Car archived successfully",
      data: updatedCar,
    });
  } catch (error) {
    sendError(res, {
      statusCode: 400,
      message: error.message,
    });
  }
};

// Unarchive car
exports.unarchiveCar = async (req, res) => {
  try {
    const carId = req.params.id;
    
    const car = await Car.findById(carId);
    
    if (!car) {
      return sendError(res, {
        statusCode: 404,
        message: "Car not found",
      });
    }
    
    // Update the car to remove archive status
    car.isArchived = false;
    car.archivedAt = null;
    car.archivedBy = null;
    
    await car.save();
    
    sendSuccess(res, {
      message: "Car unarchived successfully",
      data: car,
    });
  } catch (error) {
    sendError(res, {
      statusCode: 400,
      message: error.message,
    });
  }
};

// Validate car data (debugging endpoint)
exports.validateCarData = async (req, res) => {
  try {
    const carData = { ...req.body };
    
    console.log("Raw car data received:", carData);
    
    const { isValid, errors, warnings, processedData } = await validateCarData(carData);
    
    sendSuccess(res, {
      message: isValid ? "Car data is valid" : "Car data validation failed",
      data: {
        isValid,
        errors,
        warnings,
        originalData: carData,
        processedData: processedData,
        summary: {
          totalFields: Object.keys(carData).length,
          emptyFields: Object.keys(carData).filter(key => carData[key] === '' || carData[key] === null || carData[key] === undefined),
          objectIdFields: Object.keys(carData).filter(key => typeof carData[key] === 'string' && carData[key].length === 24),
        }
      }
    });
  } catch (error) {
    console.error("Error validating car data:", error);
    sendError(res, {
      statusCode: 400,
      message: "Error validating car data",
      errors: {
        details: error.message,
      },
    });
  }
};
