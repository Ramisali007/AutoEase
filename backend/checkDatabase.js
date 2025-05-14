const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

// Connect to database
connectDB();

// Function to check database collections
const checkDatabase = async () => {
  try {
    console.log('Checking database collections...');
    
    // Check Users collection
    const userCount = await User.countDocuments();
    console.log(`Users collection: ${userCount} documents`);
    
    if (userCount > 0) {
      const users = await User.find().select('-password');
      console.log('Sample users:');
      users.slice(0, 3).forEach(user => {
        console.log(`- ${user.name} (${user.email}), Role: ${user.role}`);
      });
    } else {
      console.log('No users found in the database. Please run the seed script.');
    }
    
    // Check Cars collection
    const carCount = await Car.countDocuments();
    console.log(`\nCars collection: ${carCount} documents`);
    
    if (carCount > 0) {
      const cars = await Car.find();
      console.log('Sample cars:');
      cars.slice(0, 3).forEach(car => {
        console.log(`- ${car.brand} ${car.model} (${car.year}), Price: $${car.pricePerDay}/day`);
      });
      
      // Check available cars
      const availableCars = await Car.countDocuments({ isAvailable: true });
      console.log(`Available cars: ${availableCars}`);
    } else {
      console.log('No cars found in the database. Please run the seed script.');
    }
    
    // Check Bookings collection
    const bookingCount = await Booking.countDocuments();
    console.log(`\nBookings collection: ${bookingCount} documents`);
    
    if (bookingCount > 0) {
      const bookings = await Booking.find().populate('user', 'name').populate('car', 'brand model');
      console.log('Sample bookings:');
      bookings.slice(0, 3).forEach(booking => {
        console.log(`- User: ${booking.user.name}, Car: ${booking.car.brand} ${booking.car.model}`);
        console.log(`  Dates: ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}`);
        console.log(`  Status: ${booking.bookingStatus}, Payment: ${booking.paymentStatus}`);
      });
    } else {
      console.log('No bookings found in the database. Please run the seed script.');
    }
    
    // Check Reviews collection
    const reviewCount = await Review.countDocuments();
    console.log(`\nReviews collection: ${reviewCount} documents`);
    
    if (reviewCount > 0) {
      const reviews = await Review.find().populate('user', 'name').populate('car', 'brand model');
      console.log('Sample reviews:');
      reviews.slice(0, 3).forEach(review => {
        console.log(`- User: ${review.user.name}, Car: ${review.car.brand} ${review.car.model}`);
        console.log(`  Rating: ${review.rating}/5, Comment: "${review.comment.substring(0, 50)}${review.comment.length > 50 ? '...' : ''}"`);
      });
      
      // Check average ratings
      const carsWithRatings = await Car.find({ averageRating: { $gt: 0 } });
      console.log(`\nCars with ratings: ${carsWithRatings.length}`);
      carsWithRatings.forEach(car => {
        console.log(`- ${car.brand} ${car.model}: ${car.averageRating.toFixed(1)}/5 (${car.reviewCount} reviews)`);
      });
    } else {
      console.log('No reviews found in the database. Please run the seed script.');
    }
    
    console.log('\nDatabase check complete.');
    
    // Disconnect from database
    mongoose.disconnect();
    
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

// Run the check function
checkDatabase();
