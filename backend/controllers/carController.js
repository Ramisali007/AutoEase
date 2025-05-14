// controllers/carController.js
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get all cars with filters
// @route   GET /api/cars
// @access  Public
exports.getCars = async (req, res) => {
  try {
    // Extract filter parameters
    const {
      brand,
      type,
      minPrice,
      maxPrice,
      minRating,
      startDate,
      endDate
    } = req.query;

    // Build query
    let query = {};

    if (brand) query.brand = brand;
    if (type) query.type = type;
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }
    if (minRating) query.averageRating = { $gte: Number(minRating) };

    // Get all cars matching the filters and populate owner details
    let cars = await Car.find(query)
      .populate('owner', 'name email phone profileImage hostBio createdAt role');

    // Get admin user for cars without a host
    const adminUser = await User.findOne({ role: 'admin' });

    // Update hostDetails for each car
    for (const car of cars) {
      // Case 1: Car has no hostDetails or incomplete hostDetails
      if (!car.hostDetails || !car.hostDetails.name) {
        if (car.owner) {
          const isAdmin = car.owner.role === 'admin';

          car.hostDetails = {
            name: car.owner.name + (isAdmin ? ' (Admin)' : ''),
            profileImage: car.owner.profileImage,
            phone: car.owner.phone || '',
            email: car.owner.email,
            hostingSince: car.owner.createdAt,
            bio: isAdmin
              ? 'This car is managed by an administrator of the platform. Feel free to contact for any questions or special requests.'
              : (car.owner.hostBio || ''),
            responseRate: 100, // Default value
            responseTime: 'Within an hour', // Default value
            averageRating: 0,
            reviewCount: 0,
            isAdmin: isAdmin // Add a flag to indicate if this is an admin-managed car
          };

          await car.save();
        } else if (adminUser) {
          // If car has no owner, use admin details
          car.hostDetails = {
            name: adminUser.name + ' (Admin)',
            profileImage: adminUser.profileImage,
            phone: adminUser.phone || '',
            email: adminUser.email,
            hostingSince: adminUser.createdAt,
            bio: 'This car is managed by an administrator of the platform. Feel free to contact for any questions or special requests.',
            responseRate: 100, // Default value
            responseTime: 'Within an hour', // Default value
            averageRating: 0,
            reviewCount: 0,
            isAdmin: true // This is an admin-managed car
          };

          await car.save();
        }
      }
      // Case 2: Car has hostDetails but owner is not a host (regular user)
      else if (car.owner && car.owner.role !== 'host' && car.owner.role !== 'admin') {
        // Replace with admin details for all non-host cars
        if (adminUser) {
          car.hostDetails = {
            name: adminUser.name + ' (Admin)',
            profileImage: adminUser.profileImage,
            phone: adminUser.phone || '',
            email: adminUser.email,
            hostingSince: adminUser.createdAt,
            bio: 'This car is managed by an administrator of the platform. Feel free to contact for any questions or special requests.',
            responseRate: 100, // Default value
            responseTime: 'Within an hour', // Default value
            averageRating: 0,
            reviewCount: 0,
            isAdmin: true // This is an admin-managed car
          };

          await car.save();
        }
      }
    }

    // If date range provided, filter out unavailable cars
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Find bookings that overlap with the requested period
      const bookings = await Booking.find({
        $and: [
          { bookingStatus: 'Active' },
          {
            $or: [
              {
                startDate: { $lte: end },
                endDate: { $gte: start }
              }
            ]
          }
        ]
      }).select('car');

      // Extract car IDs from bookings
      const bookedCarIds = bookings.map(booking => booking.car.toString());

      // Filter out booked cars
      cars = cars.filter(car => !bookedCarIds.includes(car._id.toString()));
    }

    res.json({ count: cars.length, data: cars });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
exports.getCar = async (req, res) => {
  try {
    // Find car by ID and populate the owner field to get host details
    const car = await Car.findById(req.params.id)
      .populate('owner', 'name email phone profileImage hostBio createdAt role');

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Get admin user for cars without a host
    const adminUser = await User.findOne({ role: 'admin' });

    // If the car doesn't have hostDetails or they're incomplete, update them
    if (!car.hostDetails || !car.hostDetails.name) {
      // Case 1: Car has an owner
      if (car.owner) {
        // Check if the owner is an admin
        const isAdmin = car.owner.role === 'admin';

        car.hostDetails = {
          name: car.owner.name + (isAdmin ? ' (Admin)' : ''),
          profileImage: car.owner.profileImage,
          phone: car.owner.phone || '',
          email: car.owner.email,
          hostingSince: car.owner.createdAt,
          bio: isAdmin
            ? 'This car is managed by an administrator of the platform. Feel free to contact for any questions or special requests.'
            : (car.owner.hostBio || ''),
          responseRate: 100, // Default value
          responseTime: 'Within an hour', // Default value
          averageRating: 0,
          reviewCount: 0,
          isAdmin: isAdmin // Add a flag to indicate if this is an admin-managed car
        };

        // Save the updated car
        await car.save();
      }
      // Case 2: Car has no owner, use admin details
      else if (adminUser) {
        car.hostDetails = {
          name: adminUser.name + ' (Admin)',
          profileImage: adminUser.profileImage,
          phone: adminUser.phone || '',
          email: adminUser.email,
          hostingSince: adminUser.createdAt,
          bio: 'This car is managed by an administrator of the platform. Feel free to contact for any questions or special requests.',
          responseRate: 100, // Default value
          responseTime: 'Within an hour', // Default value
          averageRating: 0,
          reviewCount: 0,
          isAdmin: true // This is an admin-managed car
        };

        // Save the updated car
        await car.save();
      }
    }
    // Case 3: Car has hostDetails but owner is not a host (regular user)
    else if (car.owner && car.owner.role !== 'host' && car.owner.role !== 'admin') {
      // Replace with admin details for all non-host cars
      if (adminUser) {
        car.hostDetails = {
          name: adminUser.name + ' (Admin)',
          profileImage: adminUser.profileImage,
          phone: adminUser.phone || '',
          email: adminUser.email,
          hostingSince: adminUser.createdAt,
          bio: 'This car is managed by an administrator of the platform. Feel free to contact for any questions or special requests.',
          responseRate: 100, // Default value
          responseTime: 'Within an hour', // Default value
          averageRating: 0,
          reviewCount: 0,
          isAdmin: true // This is an admin-managed car
        };

        // Save the updated car
        await car.save();
      }
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check car availability for specific dates
// @route   GET /api/cars/:id/availability
// @access  Public
// @desc    Get all bookings for a car
// @route   GET /api/cars/:id/bookings
// @access  Public
exports.getCarBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ car: req.params.id })
      .sort({ startDate: 1 });

    res.json({
      count: bookings.length,
      bookings: bookings.map(b => ({
        id: b._id,
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.bookingStatus,
        user: b.user
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide start and end dates' });
    }

    console.log(`Checking availability for car ${req.params.id} from ${startDate} to ${endDate}`);

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate dates
    if (start >= end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // Find any overlapping bookings for this car
    const bookings = await Booking.find({
      car: req.params.id,
      bookingStatus: 'Active',
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    console.log(`Found ${bookings.length} conflicting bookings`);
    if (bookings.length > 0) {
      console.log('Conflicting bookings:', JSON.stringify(bookings.map(b => ({
        id: b._id,
        startDate: b.startDate,
        endDate: b.endDate
      })), null, 2));
    }

    const isAvailable = bookings.length === 0;

    res.json({
      isAvailable,
      requestedDates: {
        startDate: start,
        endDate: end
      },
      conflictingBookings: isAvailable ? [] : bookings.map(b => ({
        id: b._id,
        startDate: b.startDate,
        endDate: b.endDate,
        user: b.user
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add a new car
// @route   POST /api/cars
// @access  Private (Admin)
exports.createCar = async (req, res) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create car', error: error.message });
  }
};
