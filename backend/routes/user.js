// routes/user.js
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const mongoose = require('mongoose');
const router = express.Router();

// All routes require authentication
router.use(protect);

// Get hosts whose cars the user has booked for chat
router.get('/chat/hosts', async (req, res) => {
  try {
    // Get all bookings made by this user
    const userBookings = await Booking.find({ user: req.user._id }).limit(200);

    // If no bookings found, return empty array
    if (!userBookings || userBookings.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Extract car IDs from bookings
    const carIds = [...new Set(userBookings.map(booking => {
      // Check if booking.car exists and is valid
      return booking.car ? booking.car.toString() : null;
    }).filter(id => id !== null))];

    // If no valid car IDs found, return empty array
    if (carIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Get cars with their owners
    const cars = await Car.find({ _id: { $in: carIds } }).select('owner').limit(100);

    // Extract unique host IDs from cars
    const hostIds = [...new Set(cars.map(car => {
      // Check if car.owner exists and is valid
      return car.owner ? car.owner.toString() : null;
    }).filter(id => id !== null))];

    // If no valid host IDs found, return empty array
    if (hostIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Fetch host details
    const hosts = await User.find({ 
      _id: { $in: hostIds },
      role: 'host'  // Ensure they are hosts
    })
    .select('name email profileImage role')
    .limit(50);

    res.status(200).json({
      success: true,
      count: hosts.length,
      data: hosts
    });
  } catch (error) {
    console.error('Error fetching hosts for user chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hosts for chat',
      error: error.message
    });
  }
});

module.exports = router;
