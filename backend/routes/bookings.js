// routes/bookings.js
const express = require('express');
const { 
  createBooking, 
  getUserBookings, 
  getBooking, 
  updateBookingStatus,
  generateContract,
  processPayment
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/:id', getBooking);
router.put('/:id', updateBookingStatus);
router.get('/:id/contract', generateContract);
router.post('/:id/payment', processPayment);

module.exports = router;