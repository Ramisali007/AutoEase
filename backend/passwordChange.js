// Standalone password change script
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');

// Create a standalone Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/autoease', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Use the existing User model instead of creating a new one
const User = require('./models/User');

// Password change endpoint
app.post('/change-password', async (req, res) => {
  try {
    console.log('Password change request received:', req.body);

    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      console.log('Missing required fields:', { userId: !!userId, currentPassword: !!currentPassword, newPassword: !!newPassword });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    console.log('Looking for user with ID:', userId);

    // Find the user
    let user;
    try {
      user = await User.findById(userId);
      console.log('User found:', user ? 'Yes' : 'No');
    } catch (findError) {
      console.error('Error finding user:', findError);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        error: findError.message
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', { name: user.name, email: user.email });

    // Check if current password is correct
    console.log('Comparing passwords...');
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(currentPassword, user.password);
      console.log('Password match:', isMatch);
    } catch (passwordError) {
      console.error('Error comparing passwords:', passwordError);
      return res.status(500).json({
        success: false,
        message: 'Error verifying password',
        error: passwordError.message
      });
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set the new password
    console.log('Setting new password...');
    user.password = newPassword;

    // Save the user
    try {
      await user.save();
      console.log('User saved successfully');
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Error saving new password',
        error: saveError.message
      });
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in password change:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Password change server is running' });
});

// Route to get all users (for debugging only)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }))
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Debug route to check if a user exists
app.get('/check-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Checking user with ID:', userId);

    let user;
    try {
      user = await User.findById(userId);
    } catch (findError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
        error: findError.message
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User found',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Start the server
const PORT = 5001;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Password change server running on port ${PORT}`);
  });
});
