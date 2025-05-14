// Script to check database integrity
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const ChatMessage = require('./models/ChatMessage');
const Notification = require('./models/Notification');

// Connect to database
connectDB();

// Function to check database integrity
const checkDatabaseIntegrity = async () => {
  try {
    console.log('Checking database integrity...');
    
    // Check 1: Orphaned bookings (bookings with non-existent cars or users)
    console.log('\nCheck 1: Orphaned bookings');
    
    const bookings = await Booking.find();
    console.log(`Total bookings: ${bookings.length}`);
    
    let orphanedCarBookings = 0;
    let orphanedUserBookings = 0;
    
    for (const booking of bookings) {
      const car = await Car.findById(booking.car);
      if (!car) {
        orphanedCarBookings++;
        console.log(`Booking ${booking._id} references non-existent car: ${booking.car}`);
      }
      
      const user = await User.findById(booking.user);
      if (!user) {
        orphanedUserBookings++;
        console.log(`Booking ${booking._id} references non-existent user: ${booking.user}`);
      }
    }
    
    console.log(`Orphaned car bookings: ${orphanedCarBookings}`);
    console.log(`Orphaned user bookings: ${orphanedUserBookings}`);
    
    // Check 2: Orphaned reviews (reviews with non-existent cars, users, or bookings)
    console.log('\nCheck 2: Orphaned reviews');
    
    const reviews = await Review.find();
    console.log(`Total reviews: ${reviews.length}`);
    
    let orphanedCarReviews = 0;
    let orphanedUserReviews = 0;
    let orphanedBookingReviews = 0;
    
    for (const review of reviews) {
      const car = await Car.findById(review.car);
      if (!car) {
        orphanedCarReviews++;
        console.log(`Review ${review._id} references non-existent car: ${review.car}`);
      }
      
      const user = await User.findById(review.user);
      if (!user) {
        orphanedUserReviews++;
        console.log(`Review ${review._id} references non-existent user: ${review.user}`);
      }
      
      if (review.booking) {
        const booking = await Booking.findById(review.booking);
        if (!booking) {
          orphanedBookingReviews++;
          console.log(`Review ${review._id} references non-existent booking: ${review.booking}`);
        }
      }
    }
    
    console.log(`Orphaned car reviews: ${orphanedCarReviews}`);
    console.log(`Orphaned user reviews: ${orphanedUserReviews}`);
    console.log(`Orphaned booking reviews: ${orphanedBookingReviews}`);
    
    // Check 3: Car rating consistency
    console.log('\nCheck 3: Car rating consistency');
    
    const cars = await Car.find();
    console.log(`Total cars: ${cars.length}`);
    
    let inconsistentRatingCars = 0;
    
    for (const car of cars) {
      const carReviews = await Review.find({ car: car._id });
      
      if (carReviews.length > 0) {
        const calculatedAverageRating = carReviews.reduce((sum, review) => sum + review.rating, 0) / carReviews.length;
        
        // Round to 1 decimal place for comparison
        const storedRating = Math.round(car.averageRating * 10) / 10;
        const calculatedRating = Math.round(calculatedAverageRating * 10) / 10;
        
        if (storedRating !== calculatedRating || car.reviewCount !== carReviews.length) {
          inconsistentRatingCars++;
          console.log(`Car ${car._id} (${car.brand} ${car.model}) has inconsistent rating:`);
          console.log(`  Stored: ${car.averageRating.toFixed(1)}/5 (${car.reviewCount} reviews)`);
          console.log(`  Calculated: ${calculatedAverageRating.toFixed(1)}/5 (${carReviews.length} reviews)`);
        }
      }
    }
    
    console.log(`Cars with inconsistent ratings: ${inconsistentRatingCars}`);
    
    // Check 4: Chat message integrity
    console.log('\nCheck 4: Chat message integrity');
    
    const chatMessages = await ChatMessage.find();
    console.log(`Total chat messages: ${chatMessages.length}`);
    
    let orphanedSenderMessages = 0;
    let orphanedReceiverMessages = 0;
    
    for (const message of chatMessages) {
      const sender = await User.findById(message.sender);
      if (!sender) {
        orphanedSenderMessages++;
        console.log(`Message ${message._id} references non-existent sender: ${message.sender}`);
      }
      
      const receiver = await User.findById(message.receiver);
      if (!receiver) {
        orphanedReceiverMessages++;
        console.log(`Message ${message._id} references non-existent receiver: ${message.receiver}`);
      }
    }
    
    console.log(`Messages with orphaned senders: ${orphanedSenderMessages}`);
    console.log(`Messages with orphaned receivers: ${orphanedReceiverMessages}`);
    
    // Check 5: Notification integrity
    console.log('\nCheck 5: Notification integrity');
    
    const notifications = await Notification.find();
    console.log(`Total notifications: ${notifications.length}`);
    
    let orphanedUserNotifications = 0;
    
    for (const notification of notifications) {
      const user = await User.findById(notification.user);
      if (!user) {
        orphanedUserNotifications++;
        console.log(`Notification ${notification._id} references non-existent user: ${notification.user}`);
      }
    }
    
    console.log(`Notifications with orphaned users: ${orphanedUserNotifications}`);
    
    // Summary
    console.log('\nDatabase Integrity Check Summary:');
    console.log(`- Total bookings: ${bookings.length}`);
    console.log(`  - Orphaned car bookings: ${orphanedCarBookings}`);
    console.log(`  - Orphaned user bookings: ${orphanedUserBookings}`);
    console.log(`- Total reviews: ${reviews.length}`);
    console.log(`  - Orphaned car reviews: ${orphanedCarReviews}`);
    console.log(`  - Orphaned user reviews: ${orphanedUserReviews}`);
    console.log(`  - Orphaned booking reviews: ${orphanedBookingReviews}`);
    console.log(`- Total cars: ${cars.length}`);
    console.log(`  - Cars with inconsistent ratings: ${inconsistentRatingCars}`);
    console.log(`- Total chat messages: ${chatMessages.length}`);
    console.log(`  - Messages with orphaned senders: ${orphanedSenderMessages}`);
    console.log(`  - Messages with orphaned receivers: ${orphanedReceiverMessages}`);
    console.log(`- Total notifications: ${notifications.length}`);
    console.log(`  - Notifications with orphaned users: ${orphanedUserNotifications}`);
    
    // Disconnect from database
    mongoose.disconnect();
    
  } catch (error) {
    console.error('Error checking database integrity:', error);
    process.exit(1);
  }
};

// Run the check function
checkDatabaseIntegrity();
