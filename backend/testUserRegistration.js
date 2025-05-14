// Test script to create a user in MongoDB
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

// Connect to database
connectDB();

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  phone: '1234567890',
  address: '123 Test Street',
  driverLicense: 'TEST12345'
};

// Function to create a test user
const createTestUser = async () => {
  try {
    console.log('Checking if test user already exists...');
    const existingUser = await User.findOne({ email: testUser.email });
    
    if (existingUser) {
      console.log('Test user already exists:', existingUser.name);
      mongoose.disconnect();
      return;
    }
    
    console.log('Creating test user...');
    const user = await User.create(testUser);
    
    console.log('Test user created successfully:');
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Role: ${user.role}`);
    console.log(`- ID: ${user._id}`);
    
    // Disconnect from database
    mongoose.disconnect();
    
  } catch (error) {
    console.error('Error creating test user:', error);
    mongoose.disconnect();
    process.exit(1);
  }
};

// Run the function
createTestUser();
