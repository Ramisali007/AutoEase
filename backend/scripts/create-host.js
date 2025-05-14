// Script to create a host user
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

// Connect to database
connectDB();

const createHost = async () => {
  try {
    // Check if host already exists
    const existingHost = await User.findOne({ email: 'host@autoease.com' });
    
    if (existingHost) {
      console.log('Host user already exists!');
      console.log('Email: host@autoease.com');
      console.log('Password: host123');
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('host123', salt);
    
    // Create host user
    const host = new User({
      name: 'Host User',
      email: 'host@autoease.com',
      password: hashedPassword,
      role: 'host',
      phone: '1234567890',
      address: '123 Host St',
      profileImage: 'default-profile.jpg'
    });
    
    await host.save();
    
    console.log('Host user created successfully!');
    console.log('Email: host@autoease.com');
    console.log('Password: host123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating host user:', error);
    process.exit(1);
  }
};

createHost();
