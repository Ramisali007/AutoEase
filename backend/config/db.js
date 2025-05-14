// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

// Global connection variable to reuse connection
let connection = null;

const connectDB = async () => {
  try {
    // If already connected, return the existing connection
    if (connection && mongoose.connection.readyState === 1) {
      console.log('Using existing MongoDB connection');
      return connection;
    }

    // Connection options
    const options = {
      // These options are deprecated in newer versions but kept for backward compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Add performance and reliability options
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    const mongoURI = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/autoease';
    connection = await mongoose.connect(mongoURI, options);

    // Log connection status
    console.log(`MongoDB Connected: ${connection.connection.host}`);

    // Handle connection errors after initial connection
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return connection;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;