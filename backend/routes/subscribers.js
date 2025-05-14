// routes/subscribers.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  subscribe,
  unsubscribe,
  getAllSubscribers
} = require('../controllers/subscriberController');

// Subscribe to newsletter
router.post('/', subscribe);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Subscriber routes are working' });
});

// Get all subscribers - protected route for admins only
router.get('/', protect, authorize('admin'), getAllSubscribers);

// Unsubscribe from newsletter
router.delete('/:email', unsubscribe);

module.exports = router;
