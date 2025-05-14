// routes/users.js
const express = require('express');
const { protect } = require('../middleware/auth');
const {
  updateProfile,
  updateSettings,
  getSettings,
  changePassword,
  uploadProfileImage,
  uploadDocument,
  getUserDocuments,
  deleteDocument
} = require('../controllers/userController');

const router = express.Router();

// Log all requests to user routes
router.use((req, res, next) => {
  console.log(`User route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Test route that doesn't require authentication
router.get('/test', (req, res) => {
  console.log('User test route hit');
  res.json({ message: 'User routes are working!' });
});

// All routes below this require authentication
router.use(protect);

// Update user profile
router.put('/profile', updateProfile);

// User settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Change password route
router.put('/change-password', changePassword);

// File upload routes
router.post('/profile-image', uploadProfileImage);
router.post('/documents', uploadDocument);
router.get('/documents', getUserDocuments);
router.delete('/documents/:id', deleteDocument);

module.exports = router;
