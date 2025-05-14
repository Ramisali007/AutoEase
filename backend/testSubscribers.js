// Test script for subscribers functionality
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

// Add a test subscriber
const addTestSubscriber = async (email) => {
  try {
    // Check if subscriber already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    
    if (existingSubscriber) {
      if (!existingSubscriber.active) {
        // Reactivate if inactive
        existingSubscriber.active = true;
        await existingSubscriber.save();
        console.log(`Reactivated subscriber: ${email}`);
        return existingSubscriber;
      }
      console.log(`Subscriber already exists: ${email}`);
      return existingSubscriber;
    }
    
    // Create new subscriber
    const subscriber = await Subscriber.create({
      email,
      subscriptionDate: new Date()
    });
    
    console.log(`Added new subscriber: ${email}`);
    return subscriber;
  } catch (error) {
    console.error('Error adding subscriber:', error);
    throw error;
  }
};

// Get all subscribers
const getAllSubscribers = async () => {
  try {
    const subscribers = await Subscriber.find({ active: true }).sort({ subscriptionDate: -1 });
    console.log(`Found ${subscribers.length} active subscribers`);
    return subscribers;
  } catch (error) {
    console.error('Error getting subscribers:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  const conn = await connectDB();
  
  try {
    // Add some test subscribers
    await addTestSubscriber('test1@example.com');
    await addTestSubscriber('test2@example.com');
    await addTestSubscriber('test3@example.com');
    
    // Get all subscribers
    const subscribers = await getAllSubscribers();
    
    // Display subscribers
    console.log('\nAll Active Subscribers:');
    subscribers.forEach((sub, index) => {
      console.log(`${index + 1}. ${sub.email} (Subscribed: ${sub.subscriptionDate.toLocaleString()})`);
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
