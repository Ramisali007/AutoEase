// Script to update a user's role
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

// Connect to database
connectDB();

const updateUserRole = async () => {
  try {
    // Get email from command line arguments
    const email = process.argv[2];
    const role = process.argv[3];
    
    if (!email || !role) {
      console.log('Usage: node update-user-role.js <email> <role>');
      console.log('Available roles: user, admin, moderator, host');
      process.exit(1);
    }
    
    // Validate role
    const validRoles = ['user', 'admin', 'moderator', 'host'];
    if (!validRoles.includes(role)) {
      console.log(`Invalid role: ${role}`);
      console.log('Available roles: user, admin, moderator, host');
      process.exit(1);
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    console.log(`User ${email} role updated to ${role} successfully!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating user role:', error);
    process.exit(1);
  }
};

updateUserRole();
