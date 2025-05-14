import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import api from '../services/api';
import { getCarFallbackImage } from '../utils/imageFallbacks';
import { getLocalCarFallbackImage } from '../utils/localImageFallbacks';
import '../assets/CarDetail.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faComment } from '@fortawesome/free-solid-svg-icons';
import ChatModal from '../components/ChatModal';

const CarDetail = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { setActiveChat } = useChat();

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 3)));
  const [totalDays, setTotalDays] = useState(3);
  const [totalPrice, setTotalPrice] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [availability, setAvailability] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showChatModal, setShowChatModal] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  // Fetch car details and reviews
  useEffect(() => {
    const fetchCarData = async () => {
      try {
        setLoading(true);

        // Fetch car details
        const carResponse = await api.get(`/cars/${id}`);
        console.log('Car data received:', carResponse.data);

        // Log car images specifically for debugging
        if (carResponse.data && carResponse.data.images) {
          console.log('Car images found:', carResponse.data.images);
          console.log('Number of images:', carResponse.data.images.length);

          // Log each image URL for debugging
          carResponse.data.images.forEach((imageUrl, index) => {
            console.log(`Image ${index + 1}:`, imageUrl);
          });
        } else {
          console.warn('No car images found in the response data');
        }

        // Log host details for debugging
        if (carResponse.data && carResponse.data.hostDetails) {
          console.log('Host details found:', carResponse.data.hostDetails);
          console.log('Is admin?', carResponse.data.hostDetails.isAdmin);
          console.log('Host name:', carResponse.data.hostDetails.name);
          console.log('Host profile image:', carResponse.data.hostDetails.profileImage);

          // If this is an admin-managed car, store admin info for chat
          if (carResponse.data.hostDetails.isAdmin) {
            try {
              // Fetch admin users for chat
              const adminsResponse = await api.get('/chat/admins');
              if (adminsResponse.data && adminsResponse.data.data && adminsResponse.data.data.length > 0) {
                // Use the first admin for now
                setAdminUser(adminsResponse.data.data[0]);
              }
            } catch (adminErr) {
              console.error('Error fetching admin users:', adminErr);
            }
          }
        } else if (carResponse.data && carResponse.data.owner) {
          console.log('Owner details found:', carResponse.data.owner);
          console.log('Owner role:', carResponse.data.owner.role);
          console.log('Owner name:', carResponse.data.owner.name);
          console.log('Owner profile image:', carResponse.data.owner.profileImage);
        } else {
          console.warn('No host/owner details found in the response data');
        }

        setCar(carResponse.data);

        // Calculate initial price
        const initialDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        setTotalDays(initialDays);
        setTotalPrice(initialDays * carResponse.data.pricePerDay);

        // Fetch car reviews
        const reviewsResponse = await api.get(`/reviews/car/${id}`);
        console.log('Car reviews received:', reviewsResponse.data);
        setReviews(reviewsResponse.data);

        // Check initial availability
        checkAvailability(startDate, endDate);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError('Failed to load car details: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchCarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Check car availability when dates change
  const checkAvailability = async (start, end) => {
    try {
      console.log(`Checking availability for car ${id} from ${start.toISOString()} to ${end.toISOString()}`);

      // Ensure dates are valid
      if (start >= end) {
        console.error('Invalid date range: start date must be before end date');
        setAvailability(false);
        return;
      }

      // Always set availability to true to make all cars available
      setAvailability(true);

      // Log for debugging purposes only
      try {
        // Get all bookings for this car to debug
        const bookingsResponse = await api.get(`/cars/${id}/bookings`);
        console.log('All bookings for this car (for information only):', bookingsResponse.data);

        // Check availability for selected dates (for information only)
        const response = await api.get(`/cars/${id}/availability`, {
          params: {
            startDate: start.toISOString(),
            endDate: end.toISOString()
          }
        });
        console.log('Availability response (for information only):', response.data);
      } catch (logErr) {
        console.error('Error fetching booking information (non-critical):', logErr);
      }
    } catch (err) {
      console.error('Error in availability function:', err);
      // Still set availability to true even if there's an error
      setAvailability(true);
    }
  };

  // Handle date changes
  const handleStartDateChange = (date) => {
    setStartDate(date);

    // Ensure end date is after start date
    if (date >= endDate) {
      const newEndDate = new Date(date);
      newEndDate.setDate(date.getDate() + 1);
      setEndDate(newEndDate);
    }

    // Recalculate total days and price
    const days = Math.ceil((endDate - date) / (1000 * 60 * 60 * 24));
    setTotalDays(days);
    setTotalPrice(days * (car?.pricePerDay || 0));

    // Check availability
    checkAvailability(date, endDate);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);

    // Recalculate total days and price
    const days = Math.ceil((date - startDate) / (1000 * 60 * 60 * 24));
    setTotalDays(days);
    setTotalPrice(days * (car?.pricePerDay || 0));

    // Check availability
    checkAvailability(startDate, date);
  };

  // Handle booking
  const handleBooking = () => {
    if (!currentUser) {
      // Redirect to login if not logged in
      navigate('/login', { state: { from: `/cars/${id}` } });
      return;
    }

    // Ensure we have a valid car object with _id
    if (!car || !car._id) {
      console.error('Invalid car data:', car);
      setError('Unable to book this car. Please try again later.');
      return;
    }

    // Create booking object
    const bookingData = {
      carId: car._id, // Use car._id instead of route parameter id
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalAmount: totalPrice,
      pickupLocation: "Main Office" // Added required pickupLocation field
    };

    console.log('Creating booking with car ID:', car._id);

    // Navigate to booking confirmation page with booking data
    navigate('/booking/confirm', { state: { bookingData, car } });
  };

  if (loading) {
    return <div className="loading">Loading car details...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!car) {
    return <div className="error-container">Car not found</div>;
  }

  return (
    <div className="car-detail-container">
      {showChatModal && adminUser && (
        <ChatModal
          show={showChatModal}
          onClose={() => setShowChatModal(false)}
          recipient={adminUser}
        />
      )}

      <div className="car-detail-header">
        <h1>{car.brand} {car.model} ({car.year})</h1>
        <div className="car-rating">
          <span className="stars">{'★'.repeat(Math.round(car.averageRating || 0))}</span>
          <span className="rating-count">({car.reviewCount || 0} reviews)</span>
        </div>
      </div>

      <div className="car-detail-content">
        <div className="car-images-container">
          <div className="main-image">
            <img
              src={car.images && car.images.length > activeImageIndex ? car.images[activeImageIndex] : getLocalCarFallbackImage(car, activeImageIndex)}
              alt={`${car.brand} ${car.model}`}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.log(`Car image failed to load for ${car.brand} ${car.model}, trying fallback`);
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = getLocalCarFallbackImage(car, activeImageIndex);
              }}
              style={{ pointerEvents: 'none' }}
            />
          </div>

          {car.images && car.images.length > 1 ? (
            <div className="thumbnail-images">
              {car.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${car.brand} ${car.model} thumbnail ${index + 1}`}
                  className={index === activeImageIndex ? 'active' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(index);
                  }}
                  onError={(e) => {
                    console.log(`Thumbnail image ${index + 1} failed to load for ${car.brand} ${car.model}, trying fallback`);
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = getLocalCarFallbackImage(car, index);
                  }}
                />
              ))}
            </div>
          ) : car.images && car.images.length === 1 ? (
            <div className="thumbnail-images">
              <img
                src={car.images[0]}
                alt={`${car.brand} ${car.model} thumbnail`}
                className="active"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  console.log(`Single thumbnail image failed to load for ${car.brand} ${car.model}, trying fallback`);
                  e.target.onerror = null;
                  e.target.src = getLocalCarFallbackImage(car, 0);
                }}
                style={{ pointerEvents: 'none' }}
              />
            </div>
          ) : (
            <div className="thumbnail-images">
              <img
                src={getLocalCarFallbackImage(car, 0)}
                alt={`${car.brand} ${car.model} thumbnail`}
                className="active"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/nissan.jpeg';
                }}
                style={{ pointerEvents: 'none' }}
              />
            </div>
          )}
        </div>

        <div className="car-booking-container">
          <div className="car-price">
            <span className="price-amount">${car.pricePerDay}</span>
            <span className="price-period">per day</span>
          </div>

          <div className="booking-form">
            <div className="date-pickers">
              <div className="date-picker-container">
                <label>Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()}
                  className="date-input"
                />
              </div>

              <div className="date-picker-container">
                <label>End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
                  className="date-input"
                />
              </div>
            </div>

            <div className="booking-summary">
              <div className="summary-item">
                <span>Total Days:</span>
                <span>{totalDays}</span>
              </div>
              <div className="summary-item">
                <span>Price per Day:</span>
                <span>${car.pricePerDay}</span>
              </div>
              <div className="summary-item total">
                <span>Total Price:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              className={`booking-button ${!availability ? 'disabled' : ''}`}
              onClick={handleBooking}
              disabled={!availability}
            >
              {availability ? 'Book Now' : 'Not Available'}
            </button>

            {!availability && (
              <div className="availability-warning">
                This car is not available for the selected dates. Please choose different dates.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="car-details-section">
        <h2>Car Details</h2>
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{car.type || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fuel Type:</span>
            <span className="detail-value">{car.fuelType || car.fuel_type || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Transmission:</span>
            <span className="detail-value">{car.transmission || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Seating Capacity:</span>
            <span className="detail-value">{car.seatingCapacity || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Mileage:</span>
            <span className="detail-value">
              {typeof car.mileage === 'string'
                ? car.mileage
                : car.mileage
                  ? `${car.mileage} mpg`
                  : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="car-description-section">
        <h2>Description</h2>
        <p>{car.description || 'No description available.'}</p>
      </div>

      <div className="host-details-section">
        <h2>{car.hostDetails?.isAdmin ? 'About the Administrator' : 'About the Host'}</h2>
        <div className="host-profile-container">
          <div className="host-profile-header">
            <div className={`host-avatar ${car.hostDetails?.isAdmin ? 'admin-host-avatar' : ''}`}>
              <img
                src={car.hostDetails?.profileImage || (car.hostDetails?.isAdmin ? 'https://via.placeholder.com/100?text=Admin' : 'https://via.placeholder.com/100?text=Host')}
                alt={`${car.hostDetails?.isAdmin ? 'Admin' : 'Host'} ${car.hostDetails?.name || 'Unknown'}`}
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = car.hostDetails?.isAdmin
                    ? 'https://via.placeholder.com/100?text=Admin'
                    : 'https://via.placeholder.com/100?text=Host';
                }}
                style={{ pointerEvents: 'none' }}
              />
            </div>
            <div className="host-info">
              <div className="host-name-container">
                <h3 className={car.hostDetails?.isAdmin ? 'admin-host-name' : ''}>
                  {car.hostDetails?.name || (car.hostDetails?.isAdmin ? 'Administrator' : 'Host')}
                </h3>
              </div>
              <div className="host-stats">
                <div className="host-stat">
                  <span className="stat-label">Response Rate:</span>
                  <span className="stat-value">{car.hostDetails?.responseRate || 100}%</span>
                </div>
                <div className="host-stat">
                  <span className="stat-label">Response Time:</span>
                  <span className="stat-value">{car.hostDetails?.responseTime || 'Within an hour'}</span>
                </div>
                <div className="host-stat">
                  <span className="stat-label">{car.hostDetails?.isAdmin ? 'Admin Since:' : 'Hosting Since:'}</span>
                  <span className="stat-value">
                    {car.hostDetails?.hostingSince
                      ? new Date(car.hostDetails.hostingSince).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'Recently joined'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="host-bio">
            <p>{car.hostDetails?.bio || 'No bio available.'}</p>
          </div>
          <div className="host-contact">
            {car.hostDetails?.isAdmin ? (
              <div className="admin-contact-buttons">
                <button
                  className="contact-host-btn chat-btn"
                  onClick={() => {
                    if (!currentUser) {
                      // Redirect to login if not logged in
                      navigate('/login', { state: { from: `/cars/${id}` } });
                      return;
                    }

                    if (adminUser) {
                      setActiveChat(adminUser);
                      setShowChatModal(true);
                    } else {
                      alert('Chat with administrator is not available at the moment. Please try again later or use email.');
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faComment} />
                  Contact Administrator
                </button>
              </div>
            ) : (
              <button
                className="contact-host-btn"
                onClick={() => {
                  // Open email client with host's email
                  if (car.hostDetails?.email) {
                    window.location.href = `mailto:${car.hostDetails.email}?subject=Inquiry about ${car.brand} ${car.model} (${car.year})&body=Hello ${car.hostDetails.name},%0D%0A%0D%0AI am interested in renting your ${car.brand} ${car.model} (${car.year}). Could you please provide more information?%0D%0A%0D%0AThank you.`;
                  } else {
                    alert('Contact information is not available.');
                  }
                }}
              >
                <FontAwesomeIcon icon={faEnvelope} />
                Contact Host
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="car-features-section">
        <h2>Features</h2>
        {car.features && car.features.length > 0 ? (
          <ul className="features-list">
            {car.features.map((feature, index) => (
              <li key={index} className="feature-item">{feature}</li>
            ))}
          </ul>
        ) : (
          <p>No features listed.</p>
        )}
      </div>

      <div className="car-reviews-section">
        <h2>Reviews</h2>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <img
                      src={'https://via.placeholder.com/40?text=User'}
                      alt={review.user?.name || 'User'}
                      className="reviewer-image"
                      onClick={(e) => e.stopPropagation()}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/40?text=User';
                      }}
                      style={{ pointerEvents: 'none' }}
                    />
                    <span className="reviewer-name">{review.user?.name || 'Anonymous User'}</span>
                  </div>
                  <div className="review-rating">
                    <span className="stars">{'★'.repeat(review.rating)}</span>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="review-comment">
                  {review.comment}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet. Be the first to review this car!</p>
        )}
      </div>
    </div>
  );
};

export default CarDetail;
