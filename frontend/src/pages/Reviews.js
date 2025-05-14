import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../assets/Reviews.css';

// Import icons with error handling
let FaStar, FaEdit, FaTrash;
try {
  // Use dynamic import to avoid ESLint import/first error
  const icons = require('react-icons/fa');
  FaStar = icons.FaStar;
  FaEdit = icons.FaEdit;
  FaTrash = icons.FaTrash;
} catch (error) {
  // Create fallback components if react-icons is not available
  FaStar = () => <span>★</span>;
  FaEdit = () => <span>✏️</span>;
  FaTrash = () => <span>🗑️</span>;
  console.warn('react-icons/fa not available, using fallback icons');
}

const Reviews = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Fetch user reviews
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reviews/user');
        setReviews(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load reviews: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchReviews();
  }, [currentUser, navigate]);

  // Handle edit review
  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewText(review.comment);
    setRating(review.rating);
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (err) {
      setError('Failed to delete review: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle save review
  const handleSaveReview = async () => {
    try {
      const updatedReview = {
        ...editingReview,
        comment: reviewText,
        rating
      };

      await api.put(`/reviews/${editingReview._id}`, updatedReview);

      // Update reviews list
      setReviews(reviews.map(review =>
        review._id === editingReview._id ? updatedReview : review
      ));

      // Reset form
      setEditingReview(null);
      setReviewText('');
      setRating(5);
    } catch (err) {
      setError('Failed to update review: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingReview(null);
    setReviewText('');
    setRating(5);
  };

  if (loading) {
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h1>My Reviews</h1>
        <p>Manage your car rental reviews</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {editingReview && (
        <div className="edit-review-form">
          <h2>Edit Review</h2>

          <div className="car-info">
            <img
              src={editingReview.car.images[0] || 'https://via.placeholder.com/150?text=No+Image'}
              alt={`${editingReview.car.brand} ${editingReview.car.model}`}
              className="car-thumbnail"
            />
            <div>
              <h3>{editingReview.car.brand} {editingReview.car.model}</h3>
              <p className="rental-date">
                Rented on {new Date(editingReview.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="rating-selector">
            <p>Your Rating:</p>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`star ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Your Review:</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows="4"
              placeholder="Share your experience with this car..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button className="save-button" onClick={handleSaveReview}>
              Save Changes
            </button>
            <button className="cancel-button" onClick={handleCancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {reviews.length > 0 ? (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="car-info">
                  <img
                    src={review.car.images[0] || 'https://via.placeholder.com/150?text=No+Image'}
                    alt={`${review.car.brand} ${review.car.model}`}
                    className="car-thumbnail"
                  />
                  <div>
                    <h3>{review.car.brand} {review.car.model}</h3>
                    <p className="rental-date">
                      Rented on {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="review-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEditReview(review)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteReview(review._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="review-content">
                <div className="review-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`star ${star <= review.rating ? 'active' : ''}`}
                    />
                  ))}
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="review-text">
                  {review.comment}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-reviews">
          <p>You haven't written any reviews yet.</p>
          <button
            className="browse-cars-button"
            onClick={() => navigate('/cars')}
          >
            Browse Cars to Rent
          </button>
        </div>
      )}
    </div>
  );
};

export default Reviews;
