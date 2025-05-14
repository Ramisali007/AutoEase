// routes/reviews.js
const express = require('express');
const {
  createReview,
  getCarReviews,
  getUserReviews,
  deleteReview,
  getAllReviews,
  updateReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllReviews);
router.get('/car/:carId', getCarReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/user', protect, getUserReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;