// controllers/bookingController.js
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { generatePdf } = require('../utils/pdfGenerator');
const { sendEmail } = require('../utils/emailService');
const notificationService = require('../utils/notificationService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    console.log('Creating booking with request body:', JSON.stringify(req.body, null, 2));
    console.log('User making the request:', req.user._id);

    const { carId, startDate, endDate, pickupLocation, pickupCoordinates, totalAmount } = req.body;

    // Validate required fields
    if (!carId) {
      console.log('Missing carId in request');
      return res.status(400).json({ message: 'Car ID is required' });
    }

    if (!startDate || !endDate) {
      console.log('Missing dates in request');
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    if (!pickupLocation) {
      console.log('Missing pickup location in request');
      return res.status(400).json({ message: 'Pickup location is required' });
    }

    console.log('Looking for car with ID:', carId);

    // Check if the car exists
    const car = await Car.findById(carId);
    if (!car) {
      console.log('Car not found with ID:', carId);
      return res.status(404).json({ message: 'Car not found' });
    }

    console.log('Car found:', car.brand, car.model);

    // Check if the car is available for these dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate start date is before end date
    if (start >= end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // Calculate rental duration in days
    const durationMs = end.getTime() - start.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 3600 * 24));

    // Calculate total amount
    const calculatedAmount = car.pricePerDay * durationDays;

    console.log('Checking availability for dates:', {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    });

    // Check for existing bookings that overlap with the requested period
    const existingBookings = await Booking.find({
      car: carId,
      bookingStatus: 'Active',
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    console.log(`Found ${existingBookings.length} existing bookings that overlap with requested period`);

    if (existingBookings.length > 0) {
      console.log('Conflicting bookings:', JSON.stringify(existingBookings.map(booking => ({
        id: booking._id,
        startDate: booking.startDate,
        endDate: booking.endDate
      })), null, 2));

      return res.status(400).json({
        message: 'Car is not available for the selected dates',
        conflictingBookings: existingBookings
      });
    }

    console.log('Car is available for the selected dates');

    // Prepare booking data
    const bookingData = {
      user: req.user._id,
      car: carId,
      startDate,
      endDate,
      pickupLocation,
      pickupCoordinates,
      totalAmount: totalAmount || calculatedAmount, // Use provided totalAmount or calculated amount
      invoiceNumber: `INV-${Date.now()}`
    };

    console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));

    try {
      // Create the booking
      const booking = await Booking.create(bookingData);
      console.log('Booking created successfully with ID:', booking._id);

      // Populate the booking with car and user details
      const populatedBooking = await Booking.findById(booking._id)
        .populate('car')
        .populate('user', 'name email phone');

      // Send real-time notification
      try {
        await notificationService.bookingUpdate(
          req.user._id,
          `You have successfully booked a ${car.brand} ${car.model} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}.`,
          booking._id,
          'Created'
        );
        console.log('Booking notification sent successfully');
      } catch (notificationError) {
        console.error('Error sending booking notification:', notificationError);
        // Continue with the booking process even if notification fails
      }

      console.log('Returning populated booking to client');
      res.status(201).json(populatedBooking);
    } catch (createError) {
      console.error('Error creating booking:', createError);
      return res.status(400).json({
        message: 'Failed to create booking',
        error: createError.message,
        validationErrors: createError.errors
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('car')
      .sort('-createdAt');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking belongs to the logged in user
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking belongs to the logged in user
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate contract
// @route   GET /api/bookings/:id/contract
// @access  Private
exports.generateContract = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('car')
      .populate('user', 'name email phone address driverLicense');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if the booking belongs to the logged in user
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this contract' });
    }

    // Generate PDF contract (this would be implemented in the pdfGenerator utility)
    const pdfBuffer = await generatePdf(booking);

    // Mark contract as generated
    booking.contractGenerated = true;
    await booking.save();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contract-${booking._id}.pdf`);

    // Send PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Process payment
// @route   POST /api/bookings/:id/payment
// @access  Private
exports.processPayment = async (req, res) => {
  try {
    console.log('Processing payment for booking:', req.params.id);
    console.log('Payment method:', req.body.paymentMethod);
    console.log('User:', req.user._id);

    const { paymentMethod } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      console.log('Booking not found:', req.params.id);
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Booking found:', booking._id);
    console.log('Booking user:', booking.user);
    console.log('Current user:', req.user._id);

    // Check if the booking belongs to the logged in user
    if (booking.user.toString() !== req.user._id.toString()) {
      console.log('Authorization failed - booking user does not match current user');
      return res.status(403).json({ message: 'Not authorized to make payment for this booking' });
    }

    // In a real app, you would integrate with a payment gateway here
    // For now, we'll simulate a successful payment
    booking.paymentStatus = 'Completed';
    await booking.save();
    console.log('Booking payment status updated to Completed');

    // Send real-time notification
    try {
      // Get car details for the notification message
      const populatedBooking = await Booking.findById(booking._id).populate('car');
      const car = populatedBooking.car;

      await notificationService.bookingUpdate(
        req.user._id,
        `Your payment of $${booking.totalAmount} for the ${car.brand} ${car.model} rental has been successfully processed.`,
        booking._id,
        'Payment Completed'
      );
      console.log('Payment notification sent successfully');
    } catch (notificationError) {
      console.error('Error sending payment notification:', notificationError);
      // Continue with the payment process even if notification fails
    }

    // Send confirmation email - wrapped in try/catch to prevent email errors from breaking payment
    try {
      // Check if sendEmail function exists
      if (typeof sendEmail === 'function') {
        await sendEmail(
          req.user.email,
          'Payment Confirmation - AutoEase',
          `Your payment of $${booking.totalAmount} has been successfully processed. Booking ID: ${booking._id}`
        );
        console.log('Confirmation email sent successfully');
      } else {
        console.log('sendEmail function not available, skipping email notification');
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Continue with the payment process even if email fails
    }

    console.log('Payment processed successfully');
    res.json({ success: true, booking });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
};