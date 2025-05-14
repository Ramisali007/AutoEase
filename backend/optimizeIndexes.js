// Script to optimize database indexes
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const ChatMessage = require('./models/ChatMessage');
const Notification = require('./models/Notification');
const Subscriber = require('./models/Subscriber');
const ContactMessage = require('./models/ContactMessage');

// Connect to database
connectDB();

// Function to optimize database indexes
const optimizeIndexes = async () => {
  try {
    console.log('Optimizing database indexes...');
    
    // 1. User indexes
    console.log('\n1. Optimizing User indexes');
    
    // Email index for faster login lookups
    await User.collection.createIndex({ email: 1 }, { unique: true, background: true });
    console.log('Created index on User.email');
    
    // Role index for faster role-based queries
    await User.collection.createIndex({ role: 1 }, { background: true });
    console.log('Created index on User.role');
    
    // 2. Car indexes
    console.log('\n2. Optimizing Car indexes');
    
    // Brand and model index for faster search
    await Car.collection.createIndex({ brand: 1, model: 1 }, { background: true });
    console.log('Created index on Car.brand and Car.model');
    
    // Price index for faster filtering
    await Car.collection.createIndex({ pricePerDay: 1 }, { background: true });
    console.log('Created index on Car.pricePerDay');
    
    // Type index for faster filtering
    await Car.collection.createIndex({ type: 1 }, { background: true });
    console.log('Created index on Car.type');
    
    // Availability index for faster filtering
    await Car.collection.createIndex({ isAvailable: 1 }, { background: true });
    console.log('Created index on Car.isAvailable');
    
    // Rating index for sorting by rating
    await Car.collection.createIndex({ averageRating: -1 }, { background: true });
    console.log('Created index on Car.averageRating');
    
    // Owner index for faster host car lookups
    await Car.collection.createIndex({ owner: 1 }, { background: true });
    console.log('Created index on Car.owner');
    
    // 3. Booking indexes
    console.log('\n3. Optimizing Booking indexes');
    
    // User index for faster user booking lookups
    await Booking.collection.createIndex({ user: 1 }, { background: true });
    console.log('Created index on Booking.user');
    
    // Car index for faster car booking lookups
    await Booking.collection.createIndex({ car: 1 }, { background: true });
    console.log('Created index on Booking.car');
    
    // Date range index for faster availability checks
    await Booking.collection.createIndex({ car: 1, startDate: 1, endDate: 1 }, { background: true });
    console.log('Created index on Booking.car, Booking.startDate, and Booking.endDate');
    
    // Status index for faster filtering
    await Booking.collection.createIndex({ bookingStatus: 1 }, { background: true });
    console.log('Created index on Booking.bookingStatus');
    
    // Payment status index for faster filtering
    await Booking.collection.createIndex({ paymentStatus: 1 }, { background: true });
    console.log('Created index on Booking.paymentStatus');
    
    // 4. Review indexes
    console.log('\n4. Optimizing Review indexes');
    
    // Car index for faster car review lookups
    await Review.collection.createIndex({ car: 1 }, { background: true });
    console.log('Created index on Review.car');
    
    // User index for faster user review lookups
    await Review.collection.createIndex({ user: 1 }, { background: true });
    console.log('Created index on Review.user');
    
    // Rating index for faster sorting
    await Review.collection.createIndex({ rating: -1 }, { background: true });
    console.log('Created index on Review.rating');
    
    // 5. ChatMessage indexes
    console.log('\n5. Optimizing ChatMessage indexes');
    
    // Conversation index for faster message lookups
    await ChatMessage.collection.createIndex({ sender: 1, receiver: 1, createdAt: -1 }, { background: true });
    console.log('Created index on ChatMessage.sender, ChatMessage.receiver, and ChatMessage.createdAt');
    
    // Unread messages index
    await ChatMessage.collection.createIndex({ receiver: 1, isRead: 1 }, { background: true });
    console.log('Created index on ChatMessage.receiver and ChatMessage.isRead');
    
    // 6. Notification indexes
    console.log('\n6. Optimizing Notification indexes');
    
    // User and read status index for faster notification lookups
    await Notification.collection.createIndex({ user: 1, read: 1, createdAt: -1 }, { background: true });
    console.log('Created index on Notification.user, Notification.read, and Notification.createdAt');
    
    // 7. Subscriber indexes
    console.log('\n7. Optimizing Subscriber indexes');
    
    // Email index for faster subscriber lookups
    await Subscriber.collection.createIndex({ email: 1 }, { unique: true, background: true });
    console.log('Created index on Subscriber.email');
    
    // Active status index for faster filtering
    await Subscriber.collection.createIndex({ active: 1 }, { background: true });
    console.log('Created index on Subscriber.active');
    
    // 8. ContactMessage indexes
    console.log('\n8. Optimizing ContactMessage indexes');
    
    // Read status index for faster filtering
    await ContactMessage.collection.createIndex({ isRead: 1 }, { background: true });
    console.log('Created index on ContactMessage.isRead');
    
    // Submission date index for sorting
    await ContactMessage.collection.createIndex({ submissionDate: -1 }, { background: true });
    console.log('Created index on ContactMessage.submissionDate');
    
    console.log('\nDatabase indexes optimized successfully!');
    
    // Disconnect from database
    mongoose.disconnect();
    
  } catch (error) {
    console.error('Error optimizing database indexes:', error);
    process.exit(1);
  }
};

// Run the optimize function
optimizeIndexes();
