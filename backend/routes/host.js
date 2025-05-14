const express = require('express');
const { protect, authorize, isHost } = require('../middleware/auth');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/User');
const mongoose = require('mongoose');
const { setupHostAccount, getHostDashboard } = require('../controllers/hostController');
const { carImageUpload, carImagesUpload } = require('../utils/fileUpload');
const path = require('path');
const router = express.Router();

// All routes require host or admin access
router.use(protect);
router.use(authorize('host', 'admin'));

// Host setup and dashboard routes
router.post('/setup', setupHostAccount);
router.get('/dashboard', getHostDashboard);

// Get host's cars
router.get('/cars', async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id });

    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a new car
router.post('/cars', async (req, res) => {
  try {
    console.log('Adding new car with data:', req.body);

    // Ensure required fields are present
    const requiredFields = ['brand', 'model', 'year', 'type', 'fuelType', 'transmission', 'seatingCapacity', 'pricePerDay', 'images'];
    const missingFields = requiredFields.filter(field => {
      if (field === 'images') {
        return !req.body[field] || !Array.isArray(req.body[field]) || req.body[field].length === 0;
      }
      return !req.body[field];
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        details: missingFields.includes('images') ? 'At least one car image is required' : null
      });
    }

    // Ensure location has proper structure
    const carData = {
      ...req.body,
      owner: req.user._id,
      isAvailable: true,
      location: req.body.location || {
        address: '',
        coordinates: {
          type: 'Point',
          coordinates: [0, 0]
        }
      },
      // Add host details from the current user
      hostDetails: {
        name: req.user.name,
        profileImage: req.user.profileImage,
        phone: req.user.phone || '',
        email: req.user.email,
        hostingSince: req.user.createdAt,
        bio: req.user.hostBio || '',
        responseRate: 100, // Default value
        responseTime: 'Within an hour', // Default value
        averageRating: 0,
        reviewCount: 0
      }
    };

    const newCar = new Car(carData);
    const savedCar = await newCar.save();

    console.log('Car saved successfully:', savedCar);
    res.status(201).json({
      success: true,
      message: 'Car added successfully',
      car: savedCar
    });
  } catch (error) {
    console.error('Error adding car:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add car',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

// Update a car
router.put('/cars/:id', async (req, res) => {
  try {
    console.log(`Updating car with ID: ${req.params.id}`, req.body);

    // Check if car exists and belongs to the host
    const car = await Car.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found or you do not have permission to update it'
      });
    }

    // Ensure required fields are present
    const requiredFields = ['brand', 'model', 'year', 'type', 'fuelType', 'transmission', 'seatingCapacity', 'pricePerDay'];
    const missingFields = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Ensure images array is not emptied
    if (req.body.images && (!Array.isArray(req.body.images) || req.body.images.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'At least one car image is required',
        details: 'Cannot remove all car images'
      });
    }

    // Ensure location has proper structure if it's being updated
    const updateData = { ...req.body };

    if (updateData.location) {
      updateData.location = {
        address: updateData.location.address || '',
        coordinates: updateData.location.coordinates || {
          type: 'Point',
          coordinates: [0, 0]
        }
      };
    }

    // Handle boolean conversion for isAvailable
    if (typeof updateData.isAvailable === 'string') {
      updateData.isAvailable = updateData.isAvailable === 'true';
    }

    // Update the car
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    console.log('Car updated successfully:', updatedCar);
    res.json({
      success: true,
      message: 'Car updated successfully',
      car: updatedCar
    });
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update car',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    });
  }
});

// Delete a car
router.delete('/cars/:id', async (req, res) => {
  try {
    // Check if car exists and belongs to the host
    const car = await Car.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!car) {
      return res.status(404).json({ message: 'Car not found or you do not have permission to delete it' });
    }

    // Delete all reviews for this car
    await Review.deleteMany({ car: req.params.id });

    // Delete the car
    await Car.deleteOne({ _id: req.params.id });

    res.json({ message: 'Car removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bookings for host's cars
router.get('/bookings', async (req, res) => {
  try {
    // First, get all cars owned by this host
    const hostCars = await Car.find({ owner: req.user._id });

    const carIds = hostCars.map(car => car._id);

    // Then get all bookings for these cars and populate car and user details
    const bookings = await Booking.find({ car: { $in: carIds } })
      .populate('car')
      .populate('user', 'name email phone');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get users who have booked host's cars for chat
router.get('/chat/users', async (req, res) => {
  try {
    // First, get all cars owned by this host
    const hostCars = await Car.find({ owner: req.user._id }).limit(100);

    // If no cars found, return empty array
    if (!hostCars || hostCars.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const carIds = hostCars.map(car => car._id);

    // Then get all bookings for these cars with a limit
    const bookings = await Booking.find({ car: { $in: carIds } }).limit(200);

    // If no bookings found, return empty array
    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Extract unique user IDs from bookings
    const userIds = [...new Set(bookings.map(booking => {
      // Check if booking.user exists and is valid
      return booking.user ? booking.user.toString() : null;
    }).filter(id => id !== null))];

    // If no valid user IDs found, return empty array
    if (userIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    // Fetch user details with a limit
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email profileImage role')
      .limit(50);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users for host chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users for chat',
      error: error.message
    });
  }
});

// Upload car images
router.post('/cars/upload-images', carImagesUpload, async (req, res) => {
  try {
    console.log('Processing car images upload request');

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

    // Check if car exists and belongs to the host
    const car = await Car.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!car) {
      console.warn(`Car not found or unauthorized: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Car not found or you do not have permission to update it'
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

// Get host earnings
router.get('/earnings', async (req, res) => {
  try {
    // Get all cars owned by this host
    const hostCars = await Car.find({ owner: req.user._id });

    const carIds = hostCars.map(car => car._id);

    // Get all completed bookings for these cars
    const completedBookings = await Booking.find({
      car: { $in: carIds },
      bookingStatus: 'Completed',
      paymentStatus: 'Completed'
    });

    // Calculate total earnings
    const totalEarnings = completedBookings.reduce((total, booking) => total + (booking.totalAmount || 0), 0);

    // Calculate monthly earnings (current month)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyBookings = completedBookings.filter(booking =>
      new Date(booking.createdAt) >= firstDayOfMonth
    );

    const monthlyEarnings = monthlyBookings.reduce((total, booking) => total + (booking.totalAmount || 0), 0);

    // Calculate pending earnings (bookings that are active but not completed)
    const pendingBookings = await Booking.find({
      car: { $in: carIds },
      bookingStatus: 'Active',
      paymentStatus: 'Completed'
    });

    const pendingEarnings = pendingBookings.reduce((total, booking) => total + (booking.totalAmount || 0), 0);

    res.json({
      total: totalEarnings,
      monthly: monthlyEarnings,
      pending: pendingEarnings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
