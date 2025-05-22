const Car = require("../models/cars/Car");
const { getFileUrl, getFileUrls } = require("../utils/fileUpload");
const fs = require("fs");
const path = require("path");

// Get all cars
exports.getCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
        return res.status(400).json({
          message: "Invalid componentSummary format",
          details: e.message,
          received:
            typeof carData.componentSummary === "string"
              ? carData.componentSummary.substring(0, 100) + "..."
              : typeof carData.componentSummary,
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
        return res.status(400).json({
          message: "Invalid interiorAndExterior format",
          details: e.message,
          received:
            typeof carData.interiorAndExterior === "string"
              ? carData.interiorAndExterior.substring(0, 100) + "..."
              : typeof carData.interiorAndExterior,
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

    res.status(201).json(populatedCar);
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(400).json({
      message: "Error creating car",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
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
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(car);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete car
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload car images
exports.uploadCarImages = async (req, res) => {
  try {
    if (!req.files || !req.files.images) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const carId = req.params.id;
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
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

    res.status(200).json({
      success: true,
      images: car.images,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete car image
exports.deleteCarImage = async (req, res) => {
  try {
    const { id, imageUrl } = req.params;

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Remove the image URL from the car's images array
    car.images = car.images.filter(
      (img) => img !== decodeURIComponent(imageUrl)
    );

    await car.save();

    // Optionally, delete the actual file from the server
    // This would require parsing the URL to get the file path

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      images: car.images,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
