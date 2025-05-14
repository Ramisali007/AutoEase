// controllers/reviewController.js
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Car = require('../models/Car');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    console.log('Review submission received:', req.body);
    console.log('User from request:', req.user);

    const { carId, bookingId, rating, comment } = req.body;

    // User must be authenticated to create a review
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if the car exists
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // If bookingId is provided, use it to validate
    if (bookingId) {
      try {
        const booking = await Booking.findById(bookingId);

        // Check if booking exists
        if (!booking) {
          console.log('Booking not found:', bookingId);
          return res.status(404).json({ message: 'Booking not found' });
        } else {
          // Validate that the booking belongs to the user
          console.log('Booking found:', booking._id);

          if (booking.user && booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to review this booking' });
          }
        }

        // Allow review regardless of booking status when coming from booking success page
      } catch (err) {
        console.error('Error validating booking:', err);
        return res.status(500).json({ message: 'Error validating booking', error: err.message });
      }
    } else {
      // Traditional validation if no bookingId provided
      try {
        // Check if user has rented this car before (has a completed booking)
        const userBookings = await Booking.find({
          user: req.user._id,
          car: carId
        });

        if (userBookings.length === 0 && req.user.role !== 'admin') {
          console.log('No bookings found for this user and car');
          return res.status(403).json({ message: 'You can only review cars you have rented' });
        }
      } catch (err) {
        console.error('Error checking user bookings:', err);
        return res.status(500).json({ message: 'Error checking user bookings', error: err.message });
      }
    }

    // Check if user has already reviewed this car
    const existingReview = await Review.findOne({
      user: req.user._id,
      car: carId
    });

    if (existingReview) {
      // Update the existing review instead of creating a new one
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.updatedAt = Date.now();
      await existingReview.save();

      // Return the updated review
      const populatedReview = await Review.findById(existingReview._id)
        .populate('user', 'name');

      return res.status(200).json({
        ...populatedReview.toObject(),
        message: 'Review updated successfully'
      });
    }

    // Create the review
    const review = await Review.create({
      user: req.user._id,
      car: carId,
      booking: bookingId || undefined,
      rating,
      comment
    });

    // Update car average rating
    const allReviews = await Review.find({ car: carId });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;

    car.averageRating = averageRating;
    car.reviewCount = allReviews.length;
    await car.save();

    // Return the populated review
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for a car
// @route   GET /api/reviews/car/:carId
// @access  Public
exports.getCarReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ car: req.params.carId })
      .populate('user', 'name')
      .sort('-createdAt');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews by a user
// @route   GET /api/reviews/user
// @access  Private
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('car')
      .sort('-createdAt');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
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

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the review belongs to the logged in user or if user is admin
    if (req.user && review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this review' });
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

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the review belongs to the logged in user
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    // Get the car before deleting the review to update its ratings
    const car = await Car.findById(review.car);

    // Delete the review
    await review.remove();

    // Update car average rating
    const allReviews = await Review.find({ car: review.car });

    if (allReviews.length === 0) {
      car.averageRating = 0;
      car.reviewCount = 0;
    } else {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      car.averageRating = totalRating / allReviews.length;
      car.reviewCount = allReviews.length;
    }

    await car.save();

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};