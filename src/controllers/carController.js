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
const ServiceHistory = require("../models/cars/ServiceHistory");
const Country = require("../models/cars/Country");
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
    'fuelType', 'country', 'vehicleType'
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

  ['year', 'price', 'mileage', 'numberOfKeys', 'engineSize', 'cylinder'].forEach(field => {
    if (carData[field] !== undefined && carData[field] !== null && carData[field] !== '') {
      if (typeof carData[field] === 'string') {
        const numValue = Number(carData[field]);
        if (!isNaN(numValue)) {
          carData[field] = numValue;
        } else {
          errors.push(`${field} must be a valid number, received: "${carData[field]}"`);
        }
      }
    }
  });

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

  if (carData.cylinder && (typeof carData.cylinder !== 'number' || carData.cylinder < 1 || carData.cylinder > 16)) {
    errors.push('cylinder must be a number between 1 and 16');
  }

  if (carData.transmission && !['Automatic', 'Manual'].includes(carData.transmission)) {
    errors.push('transmission must be either "Automatic" or "Manual"');
  }

  // Validate interiorAndExterior nested fields
  if (carData.interiorAndExterior && typeof carData.interiorAndExterior === 'object') {
    const interiorAndExterior = carData.interiorAndExterior;
    
    // Validate interior nested object
    if (interiorAndExterior.interior && typeof interiorAndExterior.interior === 'object') {
      const interior = interiorAndExterior.interior;
      
      // Validate navigation as boolean
      if (interior.navigation !== undefined && typeof interior.navigation !== 'boolean') {
        errors.push(`interiorAndExterior.interior.navigation must be a boolean, received: ${typeof interior.navigation}`);
      }
      
      // Validate sunroof as boolean
      if (interior.sunroof !== undefined && typeof interior.sunroof !== 'boolean') {
        errors.push(`interiorAndExterior.interior.sunroof must be a boolean, received: ${typeof interior.sunroof}`);
      }
      
      // seatType and interiorColor are strings, no specific validation needed beyond type checking
      if (interior.seatType && typeof interior.seatType !== 'string') {
        errors.push('interiorAndExterior.interior.seatType must be a string');
      }
      
      if (interior.interiorColor && typeof interior.interiorColor !== 'string') {
        errors.push('interiorAndExterior.interior.interiorColor must be a string');
      }
    }
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
      .populate("country")
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
      .populate("archivedBy", "name email")
      .sort({ createdAt: -1 });
      
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
      .populate("country")
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
    const processedData = { ...req.body };
    
    // Handle image uploads if present
    if (req.files && req.files.images) {
      try {
        processedData.images = await getFileUrls(req, req.files.images);
      } catch (error) {
        return sendError(res, {
          statusCode: 400,
          message: "Error uploading images",
          errors: { details: error.message }
        });
      }
    }

    // Data preprocessing and validation
    const { isValid, errors, warnings, processedData: validatedData } = await validateCarData(processedData);

    if (!isValid) {
      return sendError(res, {
        statusCode: 400,
        message: "Invalid car data",
        errors: errors,
        warnings: warnings,
      });
    }

    // Parse nested objects from form data with better error handling
    if (validatedData.componentSummary) {
      try {
        let parsedSummary;

        // Parse if it's a string, otherwise use as is
        if (typeof validatedData.componentSummary === "string") {
          parsedSummary = JSON.parse(validatedData.componentSummary);
        } else {
          parsedSummary = validatedData.componentSummary;
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

        validatedData.componentSummary = cleanedSummary;
      } catch (e) {
        console.error("Error parsing componentSummary:", e);
        return sendError(res, {
          statusCode: 400,
          message: "Invalid componentSummary format",
          errors: {
            details: e.message,
            received:
              typeof validatedData.componentSummary === "string"
                ? validatedData.componentSummary.substring(0, 100) + "..."
                : typeof validatedData.componentSummary,
          },
        });
      }
    }

    if (validatedData.interiorAndExterior) {
      try {
        // First check if it's already an object
        if (typeof validatedData.interiorAndExterior === "object") {
          // If it's already an object, use it as is
          console.log("interiorAndExterior is already an object");
        } else {
          // Try to parse it as JSON
          const parsed = JSON.parse(validatedData.interiorAndExterior);
          if (typeof parsed !== "object") {
            throw new Error("interiorAndExterior must be an object");
          }
          validatedData.interiorAndExterior = parsed;
        }

        // Transform flat interior fields to nested structure
        const interiorAndExterior = validatedData.interiorAndExterior;
        
        // Check if we have interior fields at the top level that need to be nested
        const interiorFields = {
          navigation: interiorAndExterior.navigationSystem,
          sunroof: interiorAndExterior.sunroof,
          seatType: interiorAndExterior.seatsType,
          interiorColor: interiorAndExterior.interiorColor
        };
        
        // Only create interior object if we have interior fields
        const hasInteriorFields = Object.values(interiorFields).some(value => value !== undefined);
        
        if (hasInteriorFields) {
          // Create the nested interior object
          interiorAndExterior.interior = {};
          
          // Move fields to interior object and remove from top level
          if (interiorFields.navigation !== undefined) {
            interiorAndExterior.interior.navigation = interiorFields.navigation;
            delete interiorAndExterior.navigationSystem;
          }
          
          if (interiorFields.sunroof !== undefined) {
            interiorAndExterior.interior.sunroof = interiorFields.sunroof;
            delete interiorAndExterior.sunroof;
          }
          
          if (interiorFields.seatType !== undefined) {
            interiorAndExterior.interior.seatType = interiorFields.seatType;
            delete interiorAndExterior.seatsType;
          }
          
          if (interiorFields.interiorColor !== undefined) {
            interiorAndExterior.interior.interiorColor = interiorFields.interiorColor;
            delete interiorAndExterior.interiorColor;
          }
        }
        
      } catch (e) {
        console.error("Error parsing interiorAndExterior:", e);
        return sendError(res, {
          statusCode: 400,
          message: "Invalid interiorAndExterior format",
          errors: {
            details: e.message,
            received:
              typeof validatedData.interiorAndExterior === "string"
                ? validatedData.interiorAndExterior.substring(0, 100) + "..."
                : typeof validatedData.interiorAndExterior,
          },
        });
      }
    }

    // Log the processed data before saving
    console.log("Processed car data:", {
      ...validatedData,
      componentSummary: validatedData.componentSummary
        ? "Present (cleaned)"
        : "Not present",
      interiorAndExterior: validatedData.interiorAndExterior
        ? "Present (parsed)"
        : "Not present",
      images: validatedData.images ? `${validatedData.images.length} images` : "No images",
    });

    const car = new Car(validatedData);
    const newCar = await car.save();

    // Populate references before sending response
    const populatedCar = await Car.findById(newCar._id)
      .populate("make")
      .populate("model")
      .populate("carDrive")
      .populate("bodyColor")
      .populate("carOptions")
      .populate("fuelType")
      .populate("country")
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
    const updates = { ...req.body };

    // Apply the same validation logic as createCar for consistency
    const { isValid, errors, warnings, processedData } = await validateCarData(updates);

    if (!isValid) {
      return sendError(res, {
        statusCode: 400,
        message: "Invalid car update data",
        errors: errors,
        warnings: warnings,
      });
    }

    // Use the processed data instead of raw body
    const validatedUpdates = processedData;

    // Handle image uploads if present
    if (req.files && req.files.images) {
      try {
        const newImages = await getFileUrls(req, req.files.images);

        // If we want to append to existing images
        if (validatedUpdates.appendImages === "true") {
          const existingCar = await Car.findById(req.params.id);
          if (existingCar) {
            validatedUpdates.images = [...existingCar.images, ...newImages];
          } else {
            validatedUpdates.images = newImages;
          }
        } else {
          // Replace existing images
          validatedUpdates.images = newImages;
        }

        // Remove appendImages from updates as it's not part of the model
        delete validatedUpdates.appendImages;
      } catch (error) {
        return sendError(res, {
          statusCode: 400,
          message: "Error uploading images",
          errors: { details: error.message }
        });
      }
    }

    const car = await Car.findByIdAndUpdate(req.params.id, validatedUpdates, {
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
    const car = await Car.findById(req.params.id);
    if (!car) {
      return sendError(res, {
        statusCode: 404,
        message: "Car not found",
      });
    }

    // Delete all car images from S3
    if (car.images && car.images.length > 0) {
      try {
        await Promise.all(car.images.map(imageUrl => deleteFile(imageUrl)));
      } catch (error) {
        console.error("Error deleting car images:", error);
        // Continue with car deletion even if image deletion fails
      }
    }

    await Car.findByIdAndDelete(req.params.id);
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

    try {
      // Get URLs for the uploaded images
      const imageUrls = await getFileUrls(req, req.files.images);

      // Update car with new images
      if (req.body.replace === "true") {
        // Delete old images from S3 if replacing
        if (car.images && car.images.length > 0) {
          await Promise.all(car.images.map(imageUrl => deleteFile(imageUrl)));
        }
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
      return sendError(res, {
        statusCode: 400,
        message: "Error uploading images",
        errors: { details: error.message }
      });
    }
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
    const decodedImageUrl = decodeURIComponent(imageUrl);

    const car = await Car.findById(id);
    if (!car) {
      return sendError(res, {
        statusCode: 404,
        message: "Car not found",
      });
    }

    // Remove the image URL from the car's images array
    car.images = car.images.filter(img => img !== decodedImageUrl);

    // Delete the image from S3
    try {
      await deleteFile(decodedImageUrl);
    } catch (error) {
      console.error("Error deleting image from S3:", error);
      // Continue with updating the car even if S3 deletion fails
    }

    await car.save();

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
      serviceHistories,
      countries,
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
      ServiceHistory.find(),
      Country.find(),
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
        serviceHistories,
        countries,
        engineSizes,
        vehicleTypes,
        ratings,
        carConditions,
        seatTypes: [
          { name: "Leather", value: "Leather" },
          { name: "Fabric", value: "Fabric" },
          { name: "Vinyl", value: "Vinyl" },
          { name: "Alcantara", value: "Alcantara" },
          { name: "Synthetic Leather", value: "Synthetic Leather" },
          { name: "Cloth", value: "Cloth" }
        ],
        transmissions: [
          { name: "Automatic", value: "Automatic" },
          { name: "Manual", value: "Manual" }
        ]
      },
    });
  } catch (error) {
    sendError(res, { message: error.message });
  }
};

// Get brand (make) by model ID
exports.getBrandByModel = async (req, res) => {
  try {
    const { modelId } = req.params;

    // Find the model and populate the make information
    const model = await Model.findById(modelId).populate("make");

    if (!model) {
      return sendError(res, {
        statusCode: 404,
        message: "Model not found",
      });
    }

    if (!model.make) {
      return sendError(res, {
        statusCode: 404,
        message: "Brand (make) not found for this model",
      });
    }

    sendSuccess(res, {
      message: "Brand retrieved successfully",
      data: {
        model: {
          _id: model._id,
          name: model.name,
          startYear: model.startYear,
          endYear: model.endYear,
          image: model.image,
        },
        brand: model.make,
      },
    });
  } catch (error) {
    // Check if it's a valid ObjectId error
    if (error.name === "CastError") {
      return sendError(res, {
        statusCode: 400,
        message: "Invalid model ID format",
      });
    }
    sendError(res, { message: error.message });
  }
};

// Get models by brand (make) ID
exports.getModelsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;

    // First, verify that the brand exists
    const brand = await Make.findById(brandId);

    if (!brand) {
      return sendError(res, {
        statusCode: 404,
        message: "Brand (make) not found",
      });
    }

    // Find all models for this brand
    const models = await Model.find({ make: brandId });

    sendSuccess(res, {
      message: "Models retrieved successfully",
      data: {
        brand: brand,
        models: models,
        count: models.length,
      },
    });
  } catch (error) {
    // Check if it's a valid ObjectId error
    if (error.name === "CastError") {
      return sendError(res, {
        statusCode: 400,
        message: "Invalid brand ID format",
      });
    }
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

// Search cars with flexible matching
exports.searchCars = async (req, res) => {
  try {
    const {
      search,        // General text search
      make,          // Brand/Make name (partial match)
      model,         // Model name (partial match)
      minYear,       // Minimum year
      maxYear,       // Maximum year
      minPrice,      // Minimum price
      maxPrice,      // Maximum price
      minMileage,    // Minimum mileage
      maxMileage,    // Maximum mileage
      bodyColor,     // Body color name (partial match)
      fuelType,      // Fuel type name (partial match)
      vehicleType,   // Vehicle type (partial match)
      approved,      // Approval status
      includeArchived, // Include archived cars
      limit = 50,    // Results limit (default 50)
      page = 1       // Page number (default 1)
    } = req.query;

    // Build the main filter
    const filter = {};
    
    // Exclude archived cars by default
    if (includeArchived !== 'true') {
      filter.isArchived = false;
    }
    
    // Filter by approval status
    if (approved === 'true') {
      filter.isApproved = true;
    } else if (approved === 'false') {
      filter.isApproved = false;
    }

    // Year range filter
    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = parseInt(minYear);
      if (maxYear) filter.year.$lte = parseInt(maxYear);
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Mileage range filter
    if (minMileage || maxMileage) {
      filter.mileage = {};
      if (minMileage) filter.mileage.$gte = parseInt(minMileage);
      if (maxMileage) filter.mileage.$lte = parseInt(maxMileage);
    }

    // Use a simpler approach with populate instead of aggregation
    let query = Car.find(filter);

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    query = query.skip(skip).limit(parseInt(limit));

    // Populate related fields
    query = query.populate('make', 'name country logo')
                 .populate('model', 'name startYear endYear image')
                 .populate('carDrive', 'name type description')
                 .populate('bodyColor', 'name hexCode type')
                 .populate('carOptions', 'name category description')
                 .populate('fuelType', 'name')
                 .populate('country', 'name')
                 .populate('vehicleType', 'name category')
                 .populate({
                   path: 'componentSummary',
                   populate: {
                     path: 'engine steering centralLock centralLocking interiorButtons gearbox dashLight audioSystem windowControl electricComponents acHeating dashboard roof breaks suspension gloveBox frontSeats exhaust clutch backSeat driveTrain',
                     model: 'Rating'
                   }
                 })
                 .populate({
                   path: 'interiorAndExterior',
                   populate: {
                     path: 'frontBumber bonnet roof reerBumber driverSideFrontWing driverSideFrontDoor driverSideRearDoor driverRearQuarter passengerSideFrontWing passengerSideFrontDoor passengerSideRearDoor passengerRearQuarter driverSideFrontTyre driverSideRearTyre passengerSideFrontTyre passengerSideRearTyre trunk frontGlass rearGlass leftGlass rightGlass',
                     model: 'CarCondition'
                   }
                 })
                 .populate('approvedBy', 'name email')
                 .populate('archivedBy', 'name email');

    // Execute the query
    const cars = await query.exec();

    // Filter results based on text search criteria
    let filteredCars = cars;

    if (search || make || model || bodyColor || fuelType || vehicleType) {
      filteredCars = cars.filter(car => {
        let matches = true;

        // General search
        if (search) {
          const searchLower = search.toLowerCase();
          const makeMatch = car.make?.name?.toLowerCase().includes(searchLower);
          const modelMatch = car.model?.name?.toLowerCase().includes(searchLower);
          const bodyColorMatch = car.bodyColor?.name?.toLowerCase().includes(searchLower);
          const fuelTypeMatch = car.fuelType?.name?.toLowerCase().includes(searchLower);
          const vehicleTypeMatch = car.vehicleType?.name?.toLowerCase().includes(searchLower);
          const descriptionMatch = car.description?.toLowerCase().includes(searchLower);
          
          matches = matches && (makeMatch || modelMatch || bodyColorMatch || fuelTypeMatch || vehicleTypeMatch || descriptionMatch);
        }

        // Specific field searches
        if (make && matches) {
          matches = matches && car.make?.name?.toLowerCase().includes(make.toLowerCase());
        }

        if (model && matches) {
          matches = matches && car.model?.name?.toLowerCase().includes(model.toLowerCase());
        }

        if (bodyColor && matches) {
          matches = matches && car.bodyColor?.name?.toLowerCase().includes(bodyColor.toLowerCase());
        }

        if (fuelType && matches) {
          matches = matches && car.fuelType?.name?.toLowerCase().includes(fuelType.toLowerCase());
        }

        if (vehicleType && matches) {
          matches = matches && car.vehicleType?.name?.toLowerCase().includes(vehicleType.toLowerCase());
        }

        return matches;
      });
    }

    // Get total count for pagination
    const totalCount = await Car.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    sendSuccess(res, {
      data: filteredCars,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      searchCriteria: {
        search,
        make,
        model,
        yearRange: minYear || maxYear ? { min: minYear, max: maxYear } : null,
        priceRange: minPrice || maxPrice ? { min: minPrice, max: maxPrice } : null,
        mileageRange: minMileage || maxMileage ? { min: minMileage, max: maxMileage } : null,
        bodyColor,
        fuelType,
        vehicleType,
        approved,
        includeArchived
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    sendError(res, { 
      message: 'Error searching cars',
      errors: error.message 
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

// Create a new make
exports.createMake = async (req, res) => {
  try {
    const { name, country, logo } = req.body;

    // Validate required fields
    if (!name) {
      return sendError(res, {
        statusCode: 400,
        message: "Make name is required",
      });
    }

    // Check if make already exists
    const existingMake = await Make.findOne({ name: name.trim() });
    if (existingMake) {
      return sendError(res, {
        statusCode: 409,
        message: "Make with this name already exists",
      });
    }

    // Create new make
    const make = new Make({
      name: name.trim(),
      country: country?.trim() || null,
      logo: logo?.trim() || null,
    });

    await make.save();

    sendSuccess(res, {
      statusCode: 201,
      message: "Make created successfully",
      data: make,
    });
  } catch (error) {
    console.error("Error creating make:", error);
    sendError(res, {
      statusCode: 500,
      message: "Error creating make",
      errors: error.message,
    });
  }
};


// Create a new model
exports.createModel = async (req, res) => {
  try {
    const { name, make, startYear, endYear, image } = req.body;

    // Validate required fields
    if (!name) {
      return sendError(res, {
        statusCode: 400,
        message: "Model name is required",
      });
    }

    if (!make) {
      return sendError(res, {
        statusCode: 400,
        message: "Make ID is required",
      });
    }

    // Validate make exists
    const makeExists = await Make.findById(make);
    if (!makeExists) {
      return sendError(res, {
        statusCode: 404,
        message: "Make not found",
      });
    }

    // Check if model already exists for this make
    const existingModel = await Model.findOne({ 
      name: name.trim(), 
      make: make 
    });
    if (existingModel) {
      return sendError(res, {
        statusCode: 409,
        message: "Model with this name already exists for this make",
      });
    }

    // Validate year range if provided
    if (startYear && endYear && parseInt(startYear) > parseInt(endYear)) {
      return sendError(res, {
        statusCode: 400,
        message: "Start year cannot be greater than end year",
      });
    }

    // Create new model
    const model = new Model({
      name: name.trim(),
      make: make,
      startYear: startYear ? parseInt(startYear) : null,
      endYear: endYear ? parseInt(endYear) : null,
      image: image?.trim() || null,
    });

    await model.save();

    // Populate the make field in the response
    await model.populate('make', 'name country logo');

    sendSuccess(res, {
      statusCode: 201,
      message: "Model created successfully",
      data: model,
    });
  } catch (error) {
    console.error("Error creating model:", error);
    sendError(res, {
      statusCode: 500,
      message: "Error creating model",
      errors: error.message,
    });
  }
};

// Get all makes
exports.getMakes = async (req, res) => {
  try {
    const makes = await Make.find({}).sort({ name: 1 });
    
    sendSuccess(res, {
      data: makes,
      message: `Found ${makes.length} makes`,
    });
  } catch (error) {
    console.error("Error fetching makes:", error);
    sendError(res, {
      statusCode: 500,
      message: "Error fetching makes",
      errors: error.message,
    });
  }
};

// Get all models (optionally filtered by make)
exports.getModels = async (req, res) => {
  try {
    const { makeId } = req.query;
    
    // Build filter
    const filter = {};
    if (makeId) {
      // Validate make exists
      const makeExists = await Make.findById(makeId);
      if (!makeExists) {
        return sendError(res, {
          statusCode: 404,
          message: "Make not found",
        });
      }
      filter.make = makeId;
    }

    const models = await Model.find(filter)
      .populate('make', 'name country logo')
      .sort({ name: 1 });
    
    sendSuccess(res, {
      data: models,
      message: `Found ${models.length} models${makeId ? ' for the specified make' : ''}`,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    sendError(res, {
      statusCode: 500,
      message: "Error fetching models",
      errors: error.message,
    });
  }
};
