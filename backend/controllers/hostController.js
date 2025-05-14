// controllers/hostController.js
const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const notificationService = require('../utils/notificationService');

// @desc    Setup new host account
// @route   POST /api/host/setup
// @access  Private/Host
exports.setupHostAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'host') {
      return res.status(403).json({ message: 'Only host accounts can access this endpoint' });
    }
    
    // Check if the host has already been set up
    if (user.hostSetupComplete) {
      return res.status(400).json({ message: 'Host account already set up' });
    }
    
    // Update host-specific fields
    const { hostBio, hostingExperience, preferredPaymentMethod } = req.body;
    
    user.hostBio = hostBio || 'New host on AutoEase';
    user.hostingExperience = hostingExperience || 'Beginner';
    user.preferredPaymentMethod = preferredPaymentMethod || 'Bank Transfer';
    user.hostSetupComplete = true;
    
    await user.save();
    
    // Send welcome notification to the host
    await notificationService.createNotification({
      user: user._id,
      title: 'Welcome to AutoEase Hosting!',
      message: 'Your host account has been set up successfully. Start adding your cars to rent them out!',
      type: 'system',
      link: '/host'
    });
    
    res.status(200).json({
      success: true,
      message: 'Host account set up successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hostBio: user.hostBio,
        hostingExperience: user.hostingExperience,
        preferredPaymentMethod: user.preferredPaymentMethod,
        hostSetupComplete: user.hostSetupComplete
      }
    });
  } catch (error) {
    console.error('Error setting up host account:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get host dashboard data
// @route   GET /api/host/dashboard
// @access  Private/Host
exports.getHostDashboard = async (req, res) => {
  try {
    // Get host's cars
    const cars = await Car.find({ owner: req.user.id });
    
    // Get bookings for host's cars
    const carIds = cars.map(car => car._id);
    const bookings = await Booking.find({ car: { $in: carIds } })
      .populate('user', 'name email phone')
      .populate('car');
    
    // Get reviews for host's cars
    const reviews = await Review.find({ car: { $in: carIds } })
      .populate('user', 'name email')
      .populate('car', 'brand model year');
    
    // Calculate earnings
    const completedBookings = bookings.filter(booking => 
      booking.bookingStatus === 'Completed' && booking.paymentStatus === 'Completed'
    );
    
    const totalEarnings = completedBookings.reduce(
      (total, booking) => total + (booking.totalAmount || 0), 
      0
    );
    
    // Calculate monthly earnings
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyBookings = completedBookings.filter(booking => 
      new Date(booking.createdAt) >= firstDayOfMonth
    );
    
    const monthlyEarnings = monthlyBookings.reduce(
      (total, booking) => total + (booking.totalAmount || 0), 
      0
    );
    
    // Calculate pending earnings
    const pendingBookings = bookings.filter(booking => 
      booking.bookingStatus === 'Active' && booking.paymentStatus === 'Completed'
    );
    
    const pendingEarnings = pendingBookings.reduce(
      (total, booking) => total + (booking.totalAmount || 0), 
      0
    );
    
    res.status(200).json({
      success: true,
      data: {
        cars: {
          total: cars.length,
          available: cars.filter(car => car.isAvailable).length,
          unavailable: cars.filter(car => !car.isAvailable).length,
          list: cars
        },
        bookings: {
          total: bookings.length,
          active: bookings.filter(booking => booking.bookingStatus === 'Active').length,
          completed: bookings.filter(booking => booking.bookingStatus === 'Completed').length,
          cancelled: bookings.filter(booking => booking.bookingStatus === 'Cancelled').length,
          list: bookings
        },
        reviews: {
          total: reviews.length,
          averageRating: reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
            : 0,
          list: reviews
        },
        earnings: {
          total: totalEarnings,
          monthly: monthlyEarnings,
          pending: pendingEarnings
        }
      }
    });
  } catch (error) {
    console.error('Error getting host dashboard data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
