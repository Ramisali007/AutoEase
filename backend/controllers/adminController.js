// controllers/adminController.js
const Car = require('../models/Car');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Add new car
// @route   POST /api/admin/cars
// @access  Private/Admin
exports.addCar = async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      type,
      fuelType,
      transmission,
      seatingCapacity,
      pricePerDay,
      mileage,
      features,
      images,
      location
    } = req.body;

    const car = await Car.create({
      brand,
      model,
      year,
      type,
      fuelType,
      transmission,
      seatingCapacity,
      pricePerDay,
      mileage,
      features,
      images,
      location
    });

    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ message: 'Invalid car data', error: error.message });
  }
};

// @desc    Update car
// @route   PUT /api/admin/cars/:id
// @access  Private/Admin
exports.updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCar);
  } catch (error) {
    res.status(400).json({ message: 'Invalid car data', error: error.message });
  }
};

// @desc    Delete car
// @route   DELETE /api/admin/cars/:id
// @access  Private/Admin
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if car has active bookings
    const activeBookings = await Booking.find({
      car: req.params.id,
      bookingStatus: 'Active'
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete car with active bookings',
        activeBookings
      });
    }

    // Delete all reviews for this car
    await Review.deleteMany({ car: req.params.id });

    // Delete car (using deleteOne instead of remove which is deprecated in Mongoose 8.x)
    await Car.deleteOne({ _id: req.params.id });

    res.json({ message: 'Car removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow password updates through this endpoint
    const { password, ...updateData } = req.body;

    // Log the role change if it's being updated
    if (updateData.role && updateData.role !== user.role) {
      console.log(`Role change for user ${user._id}: ${user.role} -> ${updateData.role}`);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Log the updated user to confirm the role was changed
    console.log('User updated successfully:', {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ message: 'Invalid user data', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all bookings by this user
    await Booking.deleteMany({ user: req.params.id });

    // Delete all reviews by this user
    await Review.deleteMany({ user: req.params.id });

    // Delete user (using deleteOne instead of remove which is deprecated in Mongoose 8.x)
    await User.deleteOne({ _id: req.params.id });

    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('car')
      .populate('user', 'name email phone')
      .sort('-createdAt');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('car')
    .populate('user', 'name email phone');

    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: 'Invalid booking data', error: error.message });
  }
};

// @desc    Delete booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // If the booking has a car, update the car's availability
    if (booking.car) {
      const car = await Car.findById(booking.car);
      if (car && booking.bookingStatus === 'Active') {
        car.isAvailable = true;
        await car.save();
      }
    }

    // Delete the booking
    await Booking.deleteOne({ _id: req.params.id });

    res.json({ message: 'Booking removed from database' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user', 'name email')
      .populate('car', 'brand model year')
      .sort('-createdAt');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/admin/reviews/:id
// @access  Private/Admin
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const { rating, comment } = req.body;

    // Update review fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    review.updatedAt = Date.now();

    await review.save();

    // Update car average rating
    const car = await Car.findById(review.car);
    if (car) {
      const allReviews = await Review.find({ car: review.car });
      const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
      car.averageRating = totalRating / allReviews.length;
      car.reviewCount = allReviews.length;
      await car.save();
    }

    // Return the updated review
    const updatedReview = await Review.findById(req.params.id)
      .populate('user', 'name email')
      .populate('car', 'brand model year');

    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: 'Invalid review data', error: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Get the car before deleting the review to update its ratings
    const car = await Car.findById(review.car);

    // Delete the review (using deleteOne instead of remove which is deprecated in Mongoose 8.x)
    await Review.deleteOne({ _id: req.params.id });

    // Update car average rating
    if (car) {
      const allReviews = await Review.find({ car: review.car });

      if (allReviews.length === 0) {
        car.averageRating = 0;
        car.reviewCount = 0;
      } else {
        const totalRating = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
        car.averageRating = totalRating / allReviews.length;
        car.reviewCount = allReviews.length;
      }

      await car.save();
    }

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Make all cars available
// @route   PUT /api/admin/cars/make-all-available
// @access  Private/Admin
exports.makeAllCarsAvailable = async (req, res) => {
  try {
    // Update all cars to be available
    const result = await Car.updateMany(
      {}, // Empty filter to match all cars
      { isAvailable: true }
    );

    res.json({
      message: `Successfully updated ${result.modifiedCount} cars to be available`,
      result
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    // Count total users, cars, bookings
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalCars = await Car.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Get revenue stats
    const completedBookings = await Booking.find({
      paymentStatus: 'Completed',
      bookingStatus: { $in: ['Active', 'Completed'] }
    });

    const totalRevenue = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    // Get most popular cars
    const popularCars = await Car.find()
      .sort('-reviewCount -averageRating')
      .limit(5);

    // Get monthly revenue for the past 6 months
    const today = new Date();
    const sixMonthsAgo = new Date(today.setMonth(today.getMonth() - 6));

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: 'Completed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalCars,
        totalBookings,
        totalRevenue
      },
      popularCars,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};