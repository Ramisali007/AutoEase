// Script to delete all moderator users from the database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

// Connect to database
connectDB();

const deleteModerators = async () => {
  try {
    // Find and delete all users with moderator role
    const result = await User.deleteMany({ role: 'moderator' });
    
    console.log(`Deleted ${result.deletedCount} moderator users from the database`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error deleting moderator users:', error);
    process.exit(1);
  }
};

deleteModerators();
