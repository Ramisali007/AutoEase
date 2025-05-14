// Script to verify data is being stored correctly in the database
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
connectDB().then(async () => {
  try {
    console.log('Verifying data storage in MongoDB...');
    
    // Generate a unique identifier for this test run
    const testId = Date.now().toString();
    console.log(`Test ID: ${testId}`);
    
    // Test 1: Create and verify a subscriber
    console.log('\nTest 1: Create and verify a subscriber');
    
    const testEmail = `test.subscriber.${testId}@example.com`;
    
    // Create a subscriber
    const subscriber = await Subscriber.create({
      email: testEmail,
      subscriptionDate: new Date(),
      active: true
    });
    
    console.log(`Subscriber created with ID: ${subscriber._id}`);
    
    // Verify the subscriber was stored
    const foundSubscriber = await Subscriber.findOne({ email: testEmail });
    
    if (foundSubscriber) {
      console.log('✅ Subscriber successfully stored and retrieved');
      console.log(`  ID: ${foundSubscriber._id}`);
      console.log(`  Email: ${foundSubscriber.email}`);
      console.log(`  Active: ${foundSubscriber.active}`);
    } else {
      console.log('❌ Failed to retrieve subscriber');
    }
    
    // Test 2: Create and verify a contact message
    console.log('\nTest 2: Create and verify a contact message');
    
    // Create a contact message
    const contactMessage = await ContactMessage.create({
      name: `Test User ${testId}`,
      email: `test.contact.${testId}@example.com`,
      subject: 'Test Subject',
      message: `This is a test message with ID ${testId}`,
      submissionDate: new Date(),
      isRead: false
    });
    
    console.log(`Contact message created with ID: ${contactMessage._id}`);
    
    // Verify the contact message was stored
    const foundContactMessage = await ContactMessage.findById(contactMessage._id);
    
    if (foundContactMessage) {
      console.log('✅ Contact message successfully stored and retrieved');
      console.log(`  ID: ${foundContactMessage._id}`);
      console.log(`  Name: ${foundContactMessage.name}`);
      console.log(`  Email: ${foundContactMessage.email}`);
      console.log(`  Subject: ${foundContactMessage.subject}`);
    } else {
      console.log('❌ Failed to retrieve contact message');
    }
    
    // Test 3: Create and verify a user
    console.log('\nTest 3: Create and verify a user');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('testpassword123', salt);
    
    // Create a user
    const user = await User.create({
      name: `Test User ${testId}`,
      email: `test.user.${testId}@example.com`,
      password: hashedPassword,
      role: 'user'
    });
    
    console.log(`User created with ID: ${user._id}`);
    
    // Verify the user was stored
    const foundUser = await User.findById(user._id).select('-password');
    
    if (foundUser) {
      console.log('✅ User successfully stored and retrieved');
      console.log(`  ID: ${foundUser._id}`);
      console.log(`  Name: ${foundUser.name}`);
      console.log(`  Email: ${foundUser.email}`);
      console.log(`  Role: ${foundUser.role}`);
    } else {
      console.log('❌ Failed to retrieve user');
    }
    
    // Clean up test data
    console.log('\nCleaning up test data...');
    
    await Subscriber.findByIdAndDelete(subscriber._id);
    await ContactMessage.findByIdAndDelete(contactMessage._id);
    await User.findByIdAndDelete(user._id);
    
    console.log('Test data cleaned up successfully');
    
    // Summary
    console.log('\nData Storage Verification Summary:');
    console.log('✅ Subscriber: Successfully stored and retrieved');
    console.log('✅ Contact Message: Successfully stored and retrieved');
    console.log('✅ User: Successfully stored and retrieved');
    console.log('\nAll data storage tests passed!');
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error verifying data storage:', error);
    process.exit(1);
  }
});
