// routes/admin.js
const express = require('express');
const {
  addCar,
  updateCar,
  deleteCar,
  makeAllCarsAvailable,
  getUsers,
  updateUser,
  deleteUser,
  getAllBookings,
  updateBooking,
  deleteBooking,
  getAllReviews,
  updateReview,
  deleteReview,
  getAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { carImageUpload, carImagesUpload } = require('../utils/fileUpload');
const Car = require('../models/Car');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// Car management
router.post('/cars', addCar);
router.put('/cars/make-all-available', makeAllCarsAvailable); // This specific route must come before the parameterized route
router.put('/cars/:id', updateCar);
router.delete('/cars/:id', deleteCar);

// Car image upload routes
router.post('/cars/upload-images', carImagesUpload, async (req, res) => {
  try {
    console.log('Processing car images upload request from admin');

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      console.warn('No files found in the request');
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one car image'
      });
    }

    console.log(`Processing ${req.files.length} uploaded car images`);

    // Get the base URL for the backend
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';

    // Create array of image URLs
    const imageUrls = req.files.map(file => {
      const filePath = `/uploads/cars/${file.filename}`;
      const url = `${baseUrl}${filePath}`;
      console.log(`Image URL created: ${url}`);
      return url;
    });

    console.log('Car images upload successful');

    res.status(200).json({
      success: true,
      message: `${req.files.length} car images uploaded successfully`,
      images: imageUrls
    });
  } catch (error) {
    console.error('Error uploading car images:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Upload car image for existing car
router.post('/cars/:id/upload-image', carImageUpload, async (req, res) => {
  try {
    console.log(`Processing car image upload for car ID: ${req.params.id}`);

    // Check if car exists
    const car = await Car.findById(req.params.id);

    if (!car) {
      console.warn(`Car not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      console.warn('No file was uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload a car image'
      });
    }

    console.log(`File uploaded: ${req.file.originalname} -> ${req.file.filename}`);

    // Get the base URL for the backend
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    const filePath = `/uploads/cars/${req.file.filename}`;
    const imageUrl = `${baseUrl}${filePath}`;

    console.log(`Image URL created: ${imageUrl}`);

    // Add the new image to the car's images array
    car.images.push(imageUrl);
    await car.save();

    console.log(`Image added to car ${car._id}, total images: ${car.images.length}`);

    res.status(200).json({
      success: true,
      message: 'Car image uploaded successfully',
      image: imageUrl,
      car: car
    });
  } catch (error) {
    console.error('Error uploading car image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Booking management
router.get('/bookings', getAllBookings);
router.put('/bookings/:id', updateBooking);
router.delete('/bookings/:id', deleteBooking);

// Review management
router.get('/reviews', getAllReviews);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;