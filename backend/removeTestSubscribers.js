// Script to remove test subscribers from the database
const mongoose = require('mongoose');
require('dotenv').config();

// Import the Subscriber model
const Subscriber = require('./models/Subscriber');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/autoease';
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

// Remove test subscribers
const removeTestSubscribers = async () => {
  try {
    // Find test subscribers
    const testEmails = ['test1@example.com', 'test2@example.com', 'test3@example.com'];
    
    // Get current subscribers before deletion
    const beforeSubscribers = await Subscriber.find({ email: { $in: testEmails } });
    console.log(`Found ${beforeSubscribers.length} test subscribers to remove`);
    
    // Remove the test subscribers
    const result = await Subscriber.deleteMany({ email: { $in: testEmails } });
    
    console.log(`Removed ${result.deletedCount} test subscribers`);
    return result;
  } catch (error) {
    console.error('Error removing test subscribers:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  const conn = await connectDB();
  
  try {
    // Get all subscribers before removal
    const allSubscribersBefore = await Subscriber.find().sort({ subscriptionDate: -1 });
    console.log('\nAll Subscribers Before Removal:');
    allSubscribersBefore.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.email} (Subscribed: ${sub.subscriptionDate.toLocaleString()}, Active: ${sub.active})`);
    });
    
    // Remove test subscribers
    await removeTestSubscribers();
    
    // Get all subscribers after removal
    const allSubscribersAfter = await Subscriber.find().sort({ subscriptionDate: -1 });
    console.log('\nAll Subscribers After Removal:');
    allSubscribersAfter.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.email} (Subscribed: ${sub.subscriptionDate.toLocaleString()}, Active: ${sub.active})`);
    });
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the main function
main();
