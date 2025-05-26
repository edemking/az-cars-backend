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
      .populate("serviceHistory")
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
      .populate("serviceHistory")
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

    // Parse nested objects from form data with better error handling
    if (carData.componentSummary) {
      try {
        let parsedSummary;

        // Parse if it's a string, otherwise use as is
        if (typeof carData.componentSummary === "string") {
          parsedSummary = JSON.parse(carData.componentSummary);
        } else {
          parsedSummary = carData.componentSummary;
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

        for (const field of fields) {
          if (parsedSummary[field]) {
            // If it's an array, take the first valid ObjectId
            if (Array.isArray(parsedSummary[field])) {
              // Filter out any template literals or invalid values
              const validIds = parsedSummary[field].filter(
                (id) =>
                  typeof id === "string" &&
                  !id.includes("{{") &&
                  !id.includes("}}") &&
                  /^[0-9a-fA-F]{24}$/.test(id)
              );

              if (validIds.length > 0) {
                cleanedSummary[field] = validIds[0]; // Take the first valid ObjectId
              }
            }
            // If it's a string and a valid ObjectId, use it
            else if (
              typeof parsedSummary[field] === "string" &&
              !parsedSummary[field].includes("{{") &&
              !parsedSummary[field].includes("}}") &&
              /^[0-9a-fA-F]{24}$/.test(parsedSummary[field])
            ) {
              cleanedSummary[field] = parsedSummary[field];
            }
          }
        }

        // Validate that we have at least one valid field
        if (Object.keys(cleanedSummary).length === 0) {
          throw new Error("No valid component ratings provided");
        }

        carData.componentSummary = cleanedSummary;

        console.log("Cleaned componentSummary:", cleanedSummary);
      } catch (e) {
        console.error("Error processing componentSummary:", e);
        return sendError(res, {
          statusCode: 400,
          message: "Invalid componentSummary format",
          errors: {
            details: e.message,
            received:
              typeof carData.componentSummary === "string"
                ? carData.componentSummary.substring(0, 100) + "..."
                : typeof carData.componentSummary,
          },
        });
      }
    }

    if (carData.interiorAndExterior) {
      try {
        // First check if it's already an object
        if (typeof carData.interiorAndExterior === "object") {
          // If it's already an object, use it as is
          console.log("interiorAndExterior is already an object");
        } else {
          // Try to parse it as JSON
          const parsed = JSON.parse(carData.interiorAndExterior);
          if (typeof parsed !== "object") {
            throw new Error("interiorAndExterior must be an object");
          }
          carData.interiorAndExterior = parsed;
        }
      } catch (e) {
        console.error("Error parsing interiorAndExterior:", e);
        return sendError(res, {
          statusCode: 400,
          message: "Invalid interiorAndExterior format",
          errors: {
            details: e.message,
            received:
              typeof carData.interiorAndExterior === "string"
                ? carData.interiorAndExterior.substring(0, 100) + "..."
                : typeof carData.interiorAndExterior,
          },
        });
      }
    }

    // Handle image uploads if present
    if (req.files && req.files.images) {
      carData.images = req.files.images.map((file) => getFileUrl(req, file));
    }

    // Log the processed data before saving
    console.log("Processed car data:", {
      ...carData,
      componentSummary: carData.componentSummary
        ? "Present (cleaned)"
        : "Not present",
      interiorAndExterior: carData.interiorAndExterior
        ? "Present (parsed)"
        : "Not present",
      images: carData.images ? `${carData.images.length} images` : "No images",
    });

    const car = new Car(carData);
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
      .populate("serviceHistory")
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
