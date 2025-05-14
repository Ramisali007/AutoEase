// routes/contact.js
const express = require('express');
const {
  submitContactMessage,
  getAllContactMessages,
  getContactMessage,
  markAsRead,
  deleteContactMessage
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public route for submitting contact messages
router.post('/', submitContactMessage);

// Admin-only routes
router.get('/', protect, authorize('admin'), getAllContactMessages);
router.get('/:id', protect, authorize('admin'), getContactMessage);
router.put('/:id/read', protect, authorize('admin'), markAsRead);
router.delete('/:id', protect, authorize('admin'), deleteContactMessage);

module.exports = router;
