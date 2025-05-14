import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { downloadBookingCertificate } from '../utils/certificateGenerator';
import BookingFeedback from '../components/BookingFeedback';
import Notification from '../components/Notification';
import '../assets/BookingSuccess.css';

// Import icons with error handling
let FaCheckCircle, FaCalendarAlt, FaMapMarkerAlt;
try {
  const icons = require('react-icons/fa');
  FaCheckCircle = icons.FaCheckCircle;
  FaCalendarAlt = icons.FaCalendarAlt;
  FaMapMarkerAlt = icons.FaMapMarkerAlt;
} catch (error) {
  // Create fallback components if react-icons is not available
  FaCheckCircle = () => <span>✓</span>;
  FaCalendarAlt = () => <span>📅</span>;
  FaMapMarkerAlt = () => <span>📍</span>;
  console.warn('react-icons/fa not available, using fallback icons');
}

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [notification, setNotification] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    startDate: new Date().toLocaleDateString(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 3)).toLocaleDateString(),
    duration: 3,
    totalAmount: 0
  });

  // Function to close notification
  const closeNotification = () => {
    setNotification(null);
  };

  // Get booking data from location state
  const { bookingId, car, bookingData: locationBookingData } = location.state || {};

  // Log state data for debugging
  console.log('Location state:', location.state);

  // Set notification based on booking status
  useEffect(() => {
    if (locationBookingData) {
      // Show appropriate notification based on payment status
      if (locationBookingData.paymentStatus === 'Completed') {
        setNotification({
          type: 'success',
          message: 'You booked a car successfully! Payment completed.'
        });
      } else {
        setNotification({
          type: 'success',
          message: 'You booked a car successfully! Payment is pending.'
        });
      }
    }
  }, [locationBookingData]);

  // Initialize with mock data if needed
  useEffect(() => {
    // Check if we have the necessary data from location state
    if (!location.state) {
      console.error('No location state found');
      navigate('/dashboard');
      return;
    }

    // If we're missing critical data, redirect to dashboard
    if (!bookingId || !car) {
      console.error('Missing booking ID or car information');
      navigate('/dashboard');
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        console.log('Processing booking data for ID:', bookingId);

        // If we have booking data in location state, use it
        if (locationBookingData) {
          console.log('Using booking data from location state:', locationBookingData);
          setBooking(locationBookingData);

          // Update booking details from location state
          const startDate = new Date(locationBookingData.startDate);
          const endDate = new Date(locationBookingData.endDate);
          const durationMs = endDate - startDate;
          const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) || 3; // Fallback to 3 days

          setBookingDetails({
            startDate: startDate.toLocaleDateString(),
            endDate: endDate.toLocaleDateString(),
            duration: durationDays,
            totalAmount: locationBookingData.totalAmount || (car.pricePerDay * durationDays)
          });

          setLoading(false);
          return;
        }

        // Always fetch from API

        // Only in production: fetch from API
        console.log('Fetching booking data from API for ID:', bookingId);
        const response = await api.get(`/bookings/${bookingId}`);
        setBooking(response.data);

        // Update booking details
        if (response.data) {
          const startDate = new Date(response.data.startDate);
          const endDate = new Date(response.data.endDate);
          const durationMs = endDate - startDate;
          const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

          setBookingDetails({
            startDate: startDate.toLocaleDateString(),
            endDate: endDate.toLocaleDateString(),
            duration: durationDays,
            totalAmount: response.data.totalAmount
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error processing booking details:', err);

        // Show error message
        setError('Failed to fetch booking details. Please try again later.');
        navigate('/dashboard');
        setLoading(false);
      }
    };

    fetchBookingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle certificate download
  const handleDownloadCertificate = () => {
    // Ensure we have car data
    const carData = car || {
      brand: 'Toyota',
      model: 'Camry',
      year: '2023',
      type: 'Sedan',
      transmission: 'Automatic',
      seatingCapacity: 5,
      pricePerDay: 50
    };

    // Ensure we have booking data
    const bookingData = {
      bookingId: bookingId || `BOOKING-${Date.now()}`,
      startDate: bookingDetails.startDate,
      endDate: bookingDetails.endDate,
      duration: bookingDetails.duration || 3,
      totalAmount: booking?.totalAmount ||
                  bookingDetails.totalAmount ||
                  (carData.pricePerDay * (bookingDetails.duration || 3))
    };

    // Ensure we have user data
    const userData = currentUser || {
      name: 'Guest User',
      email: 'guest@example.com'
    };

    console.log('Generating certificate with data:', { bookingData, carData, userData });
    downloadBookingCertificate(bookingData, carData, userData);
  };

  return (
    <div className="booking-success-container">
      <div className="success-icon">
        <FaCheckCircle />
      </div>

      <h1>Booking Confirmed!</h1>
      <p className="success-message">
        Your booking has been successfully confirmed. We've sent a confirmation email with all the details.
      </p>

      <div className="booking-reference">
        <span>Booking Reference:</span>
        <span className="reference-number">{bookingId}</span>
      </div>

      <div className="booking-summary-card">
        <div className="car-info">
          <img
            src={(car?.images && car.images[0]) || `/images/${car?.brand?.toLowerCase() || 'nissan'}.jpeg`}
            alt={car ? `${car.brand} ${car.model}` : 'Car Image'}
            className="car-thumbnail"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/nissan.jpeg';
            }}
          />
          <div>
            <h3>{car?.brand || 'Car'} {car?.model || ''} {car?.year ? `(${car.year})` : ''}</h3>
            <div className="car-specs">
              <span>{car?.type || 'Sedan'}</span>
              <span>{car?.transmission || 'Automatic'}</span>
              <span>{car?.seatingCapacity || '5'} seats</span>
            </div>
          </div>
        </div>

        <div className="booking-info">
          <div className="info-item">
            <FaCalendarAlt className="info-icon" />
            <div>
              <span className="info-label">Pickup Date</span>
              <span className="info-value">
                {bookingDetails.startDate} at 10:00 AM
              </span>
            </div>
          </div>

          <div className="info-item">
            <FaCalendarAlt className="info-icon" />
            <div>
              <span className="info-label">Return Date</span>
              <span className="info-value">
                {bookingDetails.endDate} at 10:00 AM
              </span>
            </div>
          </div>

          <div className="info-item">
            <FaMapMarkerAlt className="info-icon" />
            <div>
              <span className="info-label">Pickup Location</span>
              <span className="info-value">
                123 Main Street, City, State, 12345
              </span>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">💰</div>
            <div>
              <span className="info-label">Total Amount</span>
              <span className="info-value">
                ${bookingDetails.totalAmount?.toFixed(2) || (car.pricePerDay * bookingDetails.duration).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon">💳</div>
            <div>
              <span className="info-label">Payment Status</span>
              <span className="info-value" style={{
                color: locationBookingData?.paymentStatus === 'Completed' ? 'green' : 'orange',
                fontWeight: 'bold'
              }}>
                {locationBookingData?.paymentStatus || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="next-steps">
        <h3>Next Steps</h3>
        <ol>
          <li>Bring your driver's license and the credit card used for booking.</li>
          <li>Arrive at the pickup location at least 15 minutes before your scheduled time.</li>
          <li>Our staff will assist you with the vehicle inspection and handover.</li>
        </ol>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="action-buttons">
        <button
          className="primary-button"
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </button>

        <button
          className="secondary-button"
          onClick={() => window.print()}
        >
          Print Confirmation
        </button>

        <button
          className="certificate-button"
          onClick={handleDownloadCertificate}
          disabled={loading}
        >
          Download Certificate
        </button>

        {locationBookingData && locationBookingData.paymentStatus !== 'Completed' && (
          <button
            className="primary-button"
            style={{ backgroundColor: '#e67e22' }}
            onClick={() => navigate(`/dashboard?tab=payments&booking=${bookingId}`)}
          >
            Complete Payment
          </button>
        )}
      </div>

      {/* Feedback/Review Section */}
      <div className="feedback-section">
        <h3>Share Your Experience</h3>
        <p>We value your feedback! Please take a moment to rate your experience with this car.</p>
        <BookingFeedback
        bookingId={bookingId}
        carId={car?._id || (booking && booking.car)}
        onFeedbackSubmitted={(reviewData) => {
          console.log('Feedback submitted successfully:', reviewData);
          // Show notification when review is submitted
          setNotification({
            type: 'success',
            message: 'Thank you! Your review has been submitted successfully.'
          });
        }}
      />
      </div>

      <div className="contact-support">
        <p>
          Need help? Contact our support team at <a href="mailto:support@autoease.com">support@autoease.com</a> or call us at <a href="tel:+1234567890">123-456-7890</a>.
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
          duration={5000}
        />
      )}
    </div>
  );
};

export default BookingSuccess;
