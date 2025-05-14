import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../assets/BookingFeedback.css';

const BookingFeedback = ({ bookingId, carId, onFeedbackSubmitted }) => {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    setIsAuthenticated(!!currentUser);
    setError('');

    // Log authentication state for debugging
    console.log('Authentication state:', {
      currentUser,
      token: localStorage.getItem('token'),
      isAuthenticated: !!currentUser
    });
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      setError('Please provide a comment');
      return;
    }

    if (!carId) {
      setError('Car information is missing');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Log the feedback data for debugging
    console.log('Submitting review:', {
      rating,
      comment,
      carId,
      bookingId
    });

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }

      // Submit the review to the backend
      const response = await api.post('/reviews', {
        carId,
        bookingId,
        rating,
        comment
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Review submitted successfully:', response.data);

      // Show thank you message
      setShowThankYou(true);

      // Call the callback if provided
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted({
          rating,
          comment,
          status: 'success',
          data: response.data
        });
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="booking-feedback thank-you">
        <div className="thank-you-content">
          <div className="thank-you-icon">✓</div>
          <h3>Thank You for Your Feedback!</h3>
          <p>We appreciate you taking the time to share your experience.</p>
          <p>Your feedback helps us improve our services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-feedback">
      <h3>How was your experience?</h3>
      <p>Please share your feedback about this booking</p>

      {error && <div className="feedback-error">{error}</div>}

      {/* For demo purposes, always show the form */}
        <form onSubmit={handleSubmit}>
          <div className="rating-container">
            <label>Rating:</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= rating ? 'selected' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="comment-container">
            <label htmlFor="feedback-comment">Comments:</label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Please share your experience with this rental..."
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            className="submit-feedback"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
    </div>
  );
};

export default BookingFeedback;
