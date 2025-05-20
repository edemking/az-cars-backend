const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { protect } = require('../middleware/auth');

// Public routes - anyone can view cars
router.get('/', carController.getCars);
router.get('/:id', carController.getCar);

// Protected routes - only authenticated users can modify
router.post('/', protect, carController.createCar);
router.put('/:id', protect, carController.updateCar);
router.delete('/:id', protect, carController.deleteCar);

module.exports = router; 