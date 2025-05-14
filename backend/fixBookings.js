// Script to fix orphaned bookings
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Booking = require('./models/Booking');
const Car = require('./models/Car');

// Connect to database
connectDB();

// Function to fix orphaned bookings
const fixOrphanedBookings = async () => {
  try {
    console.log('Checking for orphaned bookings...');
    
    // Find all bookings
    const bookings = await Booking.find();
    console.log(`Found ${bookings.length} total bookings`);
    
    let orphanedBookings = 0;
    let fixedBookings = 0;
    let deletedBookings = 0;
    
    // Check each booking for a valid car reference
    for (const booking of bookings) {
      // Check if the car exists
      const car = await Car.findById(booking.car);
      
      if (!car) {
        orphanedBookings++;
        console.log(`Orphaned booking found: ${booking._id} - references non-existent car: ${booking.car}`);
        
        // Option 1: Delete the orphaned booking
        await Booking.findByIdAndDelete(booking._id);
        deletedBookings++;
        console.log(`Deleted orphaned booking: ${booking._id}`);
      }
    }
    
    console.log('\nOrphaned Bookings Summary:');
    console.log(`- Total bookings checked: ${bookings.length}`);
    console.log(`- Orphaned bookings found: ${orphanedBookings}`);
    console.log(`- Bookings deleted: ${deletedBookings}`);
    console.log(`- Bookings fixed: ${fixedBookings}`);
    
    // Disconnect from database
    mongoose.disconnect();
    
  } catch (error) {
    console.error('Error fixing orphaned bookings:', error);
    process.exit(1);
  }
};

// Run the fix function
fixOrphanedBookings();
