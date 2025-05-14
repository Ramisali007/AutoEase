const express = require('express');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { googleAuth } = require('../controllers/googleAuthController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register user (public for normal users, protected inside for admin creation logic)
router.post('/register', register);

// Login user
router.post('/login', login);

// Google authentication
router.post('/google', googleAuth);

// Get current logged-in user
router.get('/me', protect, getMe);

// Forgot password
router.post('/forgotpassword', forgotPassword);

// Reset password
router.post('/resetpassword/:resetToken', resetPassword);

module.exports = router;
