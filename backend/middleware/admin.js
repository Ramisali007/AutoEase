// middleware/admin.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify if the user has admin privileges
 * This should be used after the auth middleware to ensure the user is authenticated
 */
const adminMiddleware = async (req, res, next) => {
  try {
    // User should already be authenticated at this point
    // The auth middleware should have set req.user with the user ID

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login first.' 
      });
    }

    // Find the user in the database
    const user = await User.findById(req.user.id);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // User is an admin, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in admin authorization',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = adminMiddleware;