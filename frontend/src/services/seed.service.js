import seedData from '../data/seedData';

// This service provides mock data for development and testing
// In a production environment, these functions would make API calls

// Get all cars with optional filters
const getCars = (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredCars = [...seedData.cars];
      
      // Apply filters
      if (filters.brand) {
        filteredCars = filteredCars.filter(car => car.brand === filters.brand);
      }
      
      if (filters.type) {
        filteredCars = filteredCars.filter(car => car.type === filters.type);
      }
      
      if (filters.minPrice) {
        filteredCars = filteredCars.filter(car => car.pricePerDay >= filters.minPrice);
      }
      
      if (filters.maxPrice) {
        filteredCars = filteredCars.filter(car => car.pricePerDay <= filters.maxPrice);
      }
      
      if (filters.minRating) {
        filteredCars = filteredCars.filter(car => car.averageRating >= filters.minRating);
      }
      
      resolve({ count: filteredCars.length, data: filteredCars });
    }, 500); // Simulate network delay
  });
};

// Get a single car by ID
const getCar = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const car = seedData.cars.find(car => car._id === id);
      if (car) {
        resolve(car);
      } else {
        reject(new Error('Car not found'));
      }
    }, 500);
  });
};

// Check car availability for specific dates
const checkAvailability = (carId, startDate, endDate) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Find any overlapping bookings for this car
      const bookings = seedData.bookings.filter(booking => 
        booking.car._id === carId && 
        booking.bookingStatus === 'Active' &&
        new Date(booking.startDate) <= end &&
        new Date(booking.endDate) >= start
      );
      
      const isAvailable = bookings.length === 0;
      
      resolve({ 
        isAvailable,
        conflictingBookings: isAvailable ? [] : bookings
      });
    }, 500);
  });
};

// Get all bookings for a user
const getUserBookings = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userBookings = seedData.bookings.filter(booking => booking.user._id === userId);
      resolve(userBookings);
    }, 500);
  });
};

// Get a single booking by ID
const getBooking = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booking = seedData.bookings.find(booking => booking._id === id);
      if (booking) {
        resolve(booking);
      } else {
        reject(new Error('Booking not found'));
      }
    }, 500);
  });
};

// Create a new booking
const createBooking = (bookingData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBooking = {
        _id: `booking${seedData.bookings.length + 1}`,
        ...bookingData,
        createdAt: new Date().toISOString(),
        bookingStatus: 'Pending',
        paymentStatus: 'Pending'
      };
      
      // In a real app, this would be saved to the database
      // For now, we'll just return the new booking
      resolve(newBooking);
    }, 500);
  });
};

// Update booking status
const updateBookingStatus = (id, status) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booking = seedData.bookings.find(booking => booking._id === id);
      if (booking) {
        booking.bookingStatus = status;
        resolve(booking);
      } else {
        reject(new Error('Booking not found'));
      }
    }, 500);
  });
};

// Process payment for a booking
const processPayment = (bookingId, paymentDetails) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booking = seedData.bookings.find(booking => booking._id === bookingId);
      if (booking) {
        booking.paymentStatus = 'Completed';
        resolve({
          success: true,
          message: 'Payment processed successfully',
          booking
        });
      } else {
        reject(new Error('Booking not found'));
      }
    }, 500);
  });
};

// Get reviews for a car
const getCarReviews = (carId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const carReviews = seedData.reviews.filter(review => review.car._id === carId);
      resolve(carReviews);
    }, 500);
  });
};

// Get reviews by a user
const getUserReviews = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userReviews = seedData.reviews.filter(review => review.user._id === userId);
      resolve(userReviews);
    }, 500);
  });
};

// Create a new review
const createReview = (reviewData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newReview = {
        _id: `review${seedData.reviews.length + 1}`,
        ...reviewData,
        createdAt: new Date().toISOString()
      };
      
      // In a real app, this would be saved to the database
      // For now, we'll just return the new review
      resolve(newReview);
    }, 500);
  });
};

// Admin: Get all users
const getUsers = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(seedData.users);
    }, 500);
  });
};

// Admin: Get all bookings
const getAllBookings = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(seedData.bookings);
    }, 500);
  });
};

// Admin: Get analytics data
const getAnalytics = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(seedData.analytics);
    }, 500);
  });
};

// Export all functions
const SeedService = {
  getCars,
  getCar,
  checkAvailability,
  getUserBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  processPayment,
  getCarReviews,
  getUserReviews,
  createReview,
  getUsers,
  getAllBookings,
  getAnalytics
};

export default SeedService;
