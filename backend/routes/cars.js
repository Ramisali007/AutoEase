const express = require('express');
const {
  getCars,
  getCar,
  checkAvailability,
  getCarBookings,
  createCar
} = require('../controllers/carController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getCars);                          // Get all cars
router.get('/:id', getCar);                        // Get single car
router.get('/:id/availability', checkAvailability); // Check availability
router.get('/:id/bookings', getCarBookings);       // Get all bookings for a car

// Admin-only route to add a new car
router.post('/', protect, authorize('admin'), createCar); // Create new car

module.exports = router;
