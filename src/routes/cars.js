const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');

// Configure car image upload middleware
const uploadCarImages = upload.fields([
  { name: 'images', maxCount: 10 } // Allow up to 10 images per upload
]);

// Public routes - anyone can view cars
router.get('/', carController.getCars);
router.get('/reference/data', carController.getReferenceData);
router.get('/:id', carController.getCar);

// Protected routes - only authenticated users can modify
router.post('/', protect, uploadCarImages, carController.createCar);
router.put('/:id', protect, uploadCarImages, carController.updateCar);
router.delete('/:id', protect, carController.deleteCar);

// Car image management routes
router.post('/:id/images', protect, uploadCarImages, carController.uploadCarImages);
router.delete('/:id/images/:imageUrl', protect, carController.deleteCarImage);

module.exports = router; 