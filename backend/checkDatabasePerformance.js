// Script to check database connection and performance
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');
const Review = require('./models/Review');

// Connect to database
connectDB().then(async () => {
  try {
    console.log('Checking database connection and performance...');

    // Wait for connection to be established
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 1: Simple connection check
    console.log('\nTest 1: Connection check');
    console.log(`Connection state: ${mongoose.connection.readyState}`);
    console.log(`Connected to: ${mongoose.connection.name} at ${mongoose.connection.host}`);

    // Test 2: Query performance - Users
    console.log('\nTest 2: Query performance - Users');

    const userQueryStart = Date.now();
    const users = await User.find().select('name email role').limit(10);
    const userQueryTime = Date.now() - userQueryStart;

    console.log(`User query time: ${userQueryTime}ms`);
    console.log(`Retrieved ${users.length} users`);

    // Test 3: Query performance - Cars
    console.log('\nTest 3: Query performance - Cars');

    const carQueryStart = Date.now();
    const cars = await Car.find().select('brand model year pricePerDay').limit(10);
    const carQueryTime = Date.now() - carQueryStart;

    console.log(`Car query time: ${carQueryTime}ms`);
    console.log(`Retrieved ${cars.length} cars`);

    // Test 4: Query performance - Bookings
    console.log('\nTest 4: Query performance - Bookings');

    const bookingQueryStart = Date.now();
    const bookings = await Booking.find().select('user car startDate endDate').limit(10);
    const bookingQueryTime = Date.now() - bookingQueryStart;

    console.log(`Booking query time: ${bookingQueryTime}ms`);
    console.log(`Retrieved ${bookings.length} bookings`);

    // Test 5: Query performance - Reviews
    console.log('\nTest 5: Query performance - Reviews');

    const reviewQueryStart = Date.now();
    const reviews = await Review.find().select('user car rating comment').limit(10);
    const reviewQueryTime = Date.now() - reviewQueryStart;

    console.log(`Review query time: ${reviewQueryTime}ms`);
    console.log(`Retrieved ${reviews.length} reviews`);

    // Performance summary
    console.log('\nPerformance Summary:');
    console.log(`- User query time: ${userQueryTime}ms`);
    console.log(`- Car query time: ${carQueryTime}ms`);
    console.log(`- Booking query time: ${bookingQueryTime}ms`);
    console.log(`- Review query time: ${reviewQueryTime}ms`);

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error checking database performance:', error);
    process.exit(1);
  }
});
