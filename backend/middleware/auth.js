// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyGoogleToken, findOrCreateGoogleUser } = require('../utils/googleAuth');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  console.log('Auth middleware called for path:', req.path);

  // Extract token from authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token extracted from headers');
  }
  // Check if token is in the request body
  else if (req.body && req.body.token) {
    token = req.body.token;
    console.log('Token extracted from request body');
  }
  // Check if token is in query parameters
  else if (req.query && req.query.token) {
    token = req.query.token;
    console.log('Token extracted from query parameters');
  }

  // Check if token exists
  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({
      success: false,
      message: 'Authentication token is missing. Please log in.'
    });
  }

  try {
    // First, try to handle it as a standard JWT token
    try {
      console.log('Attempting standard JWT verification...');
      const decoded = jwt.verify(token, '477c14e81dc6f945e01a7c6b017bcaa0690136b077e62f798eba7b5d5b45e0b057b2396a92223bd224468efde89c4ee1f1c29854502912f3bff5bd317b9d7982');

      if (decoded && decoded.id) {
        console.log('JWT verification successful, looking up user');

        // Get user from the token
        const user = await User.findById(decoded.id).select('-password');

        if (user) {
          console.log('User found:', user._id);
          req.user = user;
          return next();
        } else {
          console.log('User not found for token');
          return res.status(401).json({
            success: false,
            message: 'User not found. Please log in again.'
          });
        }
      }
    } catch (jwtError) {
      console.log('Standard JWT verification failed:', jwtError.message);

      // If it's not a standard JWT token, it might be a Google token
      // or the token might be invalid
      if (jwtError.name !== 'JsonWebTokenError' && jwtError.name !== 'TokenExpiredError') {
        throw jwtError;
      }
    }

    // If we get here, the token is invalid
    console.log('Invalid authentication token');
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token. Please log in again.'
    });
  } catch (err) {
    console.error('Unexpected error in auth middleware:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Authorize middleware - checking role:', req.user?.role);
    console.log('Required roles:', roles);

    // No demo bypasses - strict role checking

    // Normal role check
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user?.role || 'unknown'}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Check if user is a host
exports.isHost = (req, res, next) => {
  console.log('isHost middleware - checking role:', req.user?.role);

  if (!req.user || (req.user.role !== 'host' && req.user.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Only hosts and admins can perform this action.'
    });
  }

  next();
};