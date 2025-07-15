const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { protect } = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');

// Configure car media upload middleware (images, videos, and PDFs)
const uploadCarMedia = upload.fields([
  { name: 'images', maxCount: 40 }, // Allow up to 40 images per upload
  { name: 'videos', maxCount: 10 }, // Allow up to 10 videos per upload
  { name: 'pdfs', maxCount: 20 }    // Allow up to 20 PDFs per upload
]);

// Public routes - anyone can view cars
router.get('/', carController.getCars);
router.get('/diagnostic', carController.getDiagnosticCars);
router.get('/search', carController.searchCars);
router.get('/reference/data', carController.getReferenceData);
router.get('/brand/model/:modelId', carController.getBrandByModel);
router.get('/models/brand/:brandId', carController.getModelsByBrand);
router.get('/makes', carController.getMakes);
router.get('/models', carController.getModels);
router.get('/:id', carController.getCar);

// Debugging route - validate car data without creating
router.post('/validate', carController.validateCarData);

// Make and Model creation routes (protected)
router.post('/makes', protect, carController.createMake);
router.post('/models', protect, carController.createModel);

// Bulk ratings creation route (protected)
router.post('/ratings/bulk', protect, carController.createBulkRatings);

// Make and Model deletion routes (protected)
router.delete('/makes/:id', protect, carController.deleteMake);
router.delete('/models/:id', protect, carController.deleteModel);

// Protected routes - only authenticated users can modify
router.post('/', protect, uploadCarMedia, carController.createCar);
router.put('/:id', protect, uploadCarMedia, carController.updateCar);
router.delete('/:id', protect, carController.deleteCar);

// Car media management routes
router.post('/:id/images', protect, uploadCarMedia, carController.uploadCarImages);
router.delete('/:id/images/:imageUrl', protect, carController.deleteCarImage);
router.post('/:id/videos', protect, uploadCarMedia, carController.uploadCarVideos);
router.delete('/:id/videos/:videoUrl', protect, carController.deleteCarVideo);
router.post('/:id/pdfs', protect, uploadCarMedia, carController.uploadCarPdfs);
router.delete('/:id/pdfs/:pdfUrl', protect, carController.deleteCarPdf);

// Car approval routes
router.put('/:id/approve', protect, carController.approveCar);
router.put('/:id/reject', protect, carController.rejectCar);

// Car archive routes
router.put('/:id/archive', protect, carController.archiveCar);
router.put('/:id/unarchive', protect, carController.unarchiveCar);

module.exports = router; 

