// Script to test data storage in MongoDB
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Subscriber = require('./models/Subscriber');
const ContactMessage = require('./models/ContactMessage');
const bcrypt = require('bcryptjs');

// Connect to database
connectDB();

// Function to test data storage
const testDataStorage = async () => {
  try {
    console.log('Testing data storage in MongoDB...');
    
    // Test 1: Create a test user
    console.log('\nTest 1: Creating a test user');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('testpassword123', salt);
    
    // Create a unique email with timestamp to avoid conflicts
    const timestamp = Date.now();
    const testEmail = `test.user.${timestamp}@example.com`;
    
    const testUser = await User.create({
      name: 'Test User',
      email: testEmail,
      password: hashedPassword,
      role: 'user'
    });
    
    console.log(`Test user created with ID: ${testUser._id}`);
    console.log(`Test user email: ${testUser.email}`);
    
    // Test 2: Create a test car
    console.log('\nTest 2: Creating a test car');
    
    const testCar = await Car.create({
      brand: 'Test Brand',
      model: `Test Model ${timestamp}`,
      year: 2023,
      type: 'Sedan',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seatingCapacity: 5,
      pricePerDay: 50,
      images: ['https://via.placeholder.com/500']
    });
    
    console.log(`Test car created with ID: ${testCar._id}`);
    
    // Test 3: Create a test booking
    console.log('\nTest 3: Creating a test booking');
    
    const testBooking = await Booking.create({
      user: testUser._id,
      car: testCar._id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      pickupLocation: 'Test Location',
      totalAmount: 150
    });
    
    console.log(`Test booking created with ID: ${testBooking._id}`);
    
    // Test 4: Create a test review
    console.log('\nTest 4: Creating a test review');
    
    const testReview = await Review.create({
      user: testUser._id,
      car: testCar._id,
      booking: testBooking._id,
      rating: 5,
      comment: 'This is a test review'
    });
    
    console.log(`Test review created with ID: ${testReview._id}`);
    
    // Test 5: Create a test subscriber
    console.log('\nTest 5: Creating a test subscriber');
    
    const testSubscriber = await Subscriber.create({
      email: `test.subscriber.${timestamp}@example.com`
    });
    
    console.log(`Test subscriber created with ID: ${testSubscriber._id}`);
    
    // Test 6: Create a test contact message
    console.log('\nTest 6: Creating a test contact message');
    
    const testContactMessage = await ContactMessage.create({
      name: 'Test Contact',
      email: `test.contact.${timestamp}@example.com`,
      subject: 'Test Subject',
      message: 'This is a test contact message'
    });
    
    console.log(`Test contact message created with ID: ${testContactMessage._id}`);
    
    // Test 7: Verify data retrieval
    console.log('\nTest 7: Verifying data retrieval');
    
    // Retrieve the test user
    const retrievedUser = await User.findById(testUser._id).select('-password');
    console.log(`Retrieved user: ${retrievedUser.name} (${retrievedUser.email})`);
    
    // Retrieve the test car
    const retrievedCar = await Car.findById(testCar._id);
    console.log(`Retrieved car: ${retrievedCar.brand} ${retrievedCar.model} (${retrievedCar.year})`);
    
    // Retrieve the test booking
    const retrievedBooking = await Booking.findById(testBooking._id);
    console.log(`Retrieved booking: ${retrievedBooking._id} for car ${retrievedBooking.car}`);
    
    // Retrieve the test review
    const retrievedReview = await Review.findById(testReview._id);
    console.log(`Retrieved review: Rating ${retrievedReview.rating}/5 - "${retrievedReview.comment}"`);
    
    // Test 8: Clean up test data
    console.log('\nTest 8: Cleaning up test data');
    
    await Review.findByIdAndDelete(testReview._id);
    await Booking.findByIdAndDelete(testBooking._id);
    await Car.findByIdAndDelete(testCar._id);
    await User.findByIdAndDelete(testUser._id);
    await Subscriber.findByIdAndDelete(testSubscriber._id);
    await ContactMessage.findByIdAndDelete(testContactMessage._id);
    
    console.log('All test data cleaned up successfully');
    
    console.log('\nData storage test completed successfully!');
    
    // Disconnect from database
    mongoose.disconnect();
    
  } catch (error) {
    console.error('Error testing data storage:', error);
    process.exit(1);
  }
};

// Run the test function
testDataStorage();
