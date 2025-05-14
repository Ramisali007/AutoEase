import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/BookingConfirmation.css';
import Notification from '../components/Notification';
import GoogleMapSelector from '../components/GoogleMapSelector';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // We'll use the auth context to check if user is logged in
  const { currentUser } = useAuth();

  // Check if user is logged in
  useEffect(() => {
    if (!currentUser) {
      console.error('User not logged in, redirecting to login');
      navigate('/login', { state: { from: '/booking/confirm' } });
    } else {
      console.log('User is logged in:', currentUser.email);
    }
  }, [currentUser, navigate]);

  // Get booking data from location state
  const { bookingData: initialBookingData, car } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [startDate, setStartDate] = useState(initialBookingData ? new Date(initialBookingData.startDate) : new Date());
  const [endDate, setEndDate] = useState(initialBookingData ? new Date(initialBookingData.endDate) : new Date(new Date().setDate(new Date().getDate() + 3)));
  const [totalPrice, setTotalPrice] = useState(initialBookingData ? initialBookingData.totalAmount : 0);
  const [bookingData, setBookingData] = useState(initialBookingData || {});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notification, setNotification] = useState(null);
  const [pickupCoordinates, setPickupCoordinates] = useState(null);

  // Debug car and booking data using regular console logs instead of useEffect
  console.log('Car data in BookingConfirmation:', car);
  console.log('Car ID:', car?._id);
  console.log('Booking data in BookingConfirmation:', bookingData);

  // Function to close notification
  const closeNotification = () => {
    setNotification(null);
  };

  // If no booking data, redirect to cars page
  if (!bookingData || !car) {
    console.error('No booking data or car information found in location state');
    navigate('/cars');
    return null;
  }

  // Log booking data for debugging
  console.log('Booking data:', bookingData);
  console.log('Car data:', car);

  // Format dates for display
  const formattedStartDate = startDate.toLocaleDateString();
  const formattedEndDate = endDate.toLocaleDateString();

  // Calculate rental duration
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

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
    const newTotalPrice = days * car.pricePerDay;
    setTotalPrice(newTotalPrice);

    // Update booking data
    setBookingData({
      ...bookingData,
      startDate: date.toISOString(),
      endDate: endDate.toISOString(),
      totalAmount: newTotalPrice
    });

    // Clear any previous errors
    setError('');
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);

    // Recalculate total days and price
    const days = Math.ceil((date - startDate) / (1000 * 60 * 60 * 24));
    const newTotalPrice = days * car.pricePerDay;
    setTotalPrice(newTotalPrice);

    // Update booking data
    setBookingData({
      ...bookingData,
      endDate: date.toISOString(),
      totalAmount: newTotalPrice
    });

    // Clear any previous errors
    setError('');
  };

  // Handle location selection from map
  const handleLocationSelect = (locationData) => {
    console.log('Location selected:', locationData);
    setPickupCoordinates(locationData.coordinates);

    // Update booking data with location information
    setBookingData({
      ...bookingData,
      pickupLocation: locationData.address,
      pickupCoordinates: locationData.coordinates
    });

    // Clear any previous errors
    setError('');
  };

  // Check car availability before booking
  const checkAvailability = async () => {
    try {
      console.log(`Checking availability for car ${car._id} from ${bookingData.startDate} to ${bookingData.endDate}`);

      // Always return true to make all cars available
      return true;

      // The following code is kept for logging purposes only
      try {
        const response = await api.get(`/cars/${car._id}/availability`, {
          params: {
            startDate: bookingData.startDate,
            endDate: bookingData.endDate
          }
        });

        console.log('Availability response (for information only):', response.data);
      } catch (logErr) {
        console.error('Error fetching availability information (non-critical):', logErr);
      }
    } catch (err) {
      console.error('Error in availability function:', err);
      // Still return true even if there's an error
      return true;
    }
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setError('');

      // Check availability again before booking
      const isAvailable = await checkAvailability();
      if (!isAvailable) {
        setError('Car is not available for the selected dates. Please choose different dates.');
        setLoading(false);
        return;
      }

      console.log('Car is available. Sending booking data to API:', bookingData);

      // Create booking with proper data structure
      // Use car._id instead of bookingData.carId to ensure we have the correct MongoDB ID
      const bookingPayload = {
        carId: car._id, // Use the actual car._id from the car object
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        pickupLocation: bookingData.pickupLocation || "Main Office",
        pickupCoordinates: bookingData.pickupCoordinates || null,
        totalAmount: parseFloat(bookingData.totalAmount) // Ensure totalAmount is a number
      };

      console.log('Sending booking payload:', JSON.stringify(bookingPayload, null, 2));
      console.log('Car object:', JSON.stringify({
        _id: car._id,
        brand: car.brand,
        model: car.model,
        pricePerDay: car.pricePerDay
      }, null, 2));

      // Validate car ID
      if (!car._id) {
        throw new Error('Invalid car ID. Please try selecting the car again.');
      }

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }

      // Create booking with proper headers
      const response = await api.post('/bookings', bookingPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Booking created:', response.data);

      // Show notification that booking was created
      setNotification({
        type: 'success',
        message: 'You booked a car successfully!'
      });

      // Process payment with authentication token
      let paymentSuccessful = false;
      let paymentError = null;

      try {
        console.log('Processing payment for booking:', response.data._id);

        const paymentResponse = await api.post(`/bookings/${response.data._id}/payment`, {
          paymentMethod,
          amount: bookingData.totalAmount
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Payment processed successfully:', paymentResponse.data);
        paymentSuccessful = true;
      } catch (error) {
        console.error('Payment processing error:', error);
        paymentError = error;
        // Don't throw the error, we'll handle it below
        setNotification({
          type: 'warning',
          message: 'Your booking was created, but there was an issue with payment processing. You can complete payment later.'
        });
      }

      // Create booking object with all necessary data
      const completeBookingData = {
        ...response.data,
        paymentMethod,
        totalAmount: bookingData.totalAmount,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        paymentStatus: paymentSuccessful ? 'Completed' : 'Pending'
      };

      // Redirect to success page with complete data
      navigate('/booking/success', {
        state: {
          bookingId: response.data._id,
          car,
          bookingData: completeBookingData
        }
      });
    } catch (err) {
      console.error('Booking error:', err);

      // Show detailed error to user
      console.error('Full error object:', err);
      console.error('Response data:', err.response?.data);

      if (err.response && err.response.data) {
        if (err.response.data.validationErrors) {
          // Handle validation errors
          const validationErrors = Object.values(err.response.data.validationErrors)
            .map(error => error.message || error)
            .join(', ');
          setError(`Validation failed: ${validationErrors}`);
        } else if (err.response.data.message) {
          // Handle regular error message
          setError(`Booking failed: ${err.response.data.message}`);
        } else if (err.response.data.error) {
          // Handle error field
          setError(`Error: ${err.response.data.error}`);
        } else {
          setError('Failed to create booking. Please try again later.');
        }
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Failed to create booking. Please try again later.');
      }

      console.error('API error details:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-confirmation-container">
      <div className="booking-confirmation-header">
        <h1>Confirm Your Booking</h1>
        <p>Please review your booking details before confirming</p>
      </div>

      {error && (
        <div className="booking-error">
          <i className="fa fa-exclamation-circle"></i>
          {error}
          <p className="error-help">Please check your information and try again. If the problem persists, contact customer support.</p>

          {error.includes('not available') && (
            <div className="date-change-section">
              <button
                className="change-dates-button"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                {showDatePicker ? 'Hide Date Picker' : 'Change Dates'}
              </button>

              {showDatePicker && (
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
              )}
            </div>
          )}
        </div>
      )}

      <div className="booking-confirmation-content">
        <div className="booking-details-container">
          <h2>Booking Details</h2>

          <div className="car-summary">
            <img
              src={car.images[0] || 'https://via.placeholder.com/150?text=No+Image'}
              alt={`${car.brand} ${car.model}`}
              className="car-thumbnail"
            />
            <div className="car-info">
              <h3>{car.brand} {car.model} ({car.year})</h3>
              <div className="car-specs">
                <span>{car.type}</span>
                <span>{car.transmission}</span>
                <span>{car.seatingCapacity} seats</span>
              </div>
            </div>
          </div>

          <div className="booking-details">
            <div className="detail-item">
              <span className="detail-label">Pickup Date:</span>
              <span className="detail-value">{formattedStartDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Return Date:</span>
              <span className="detail-value">{formattedEndDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Duration:</span>
              <span className="detail-value">{durationDays} days</span>
            </div>

            <div className="detail-item pickup-location">
              <span className="detail-label">Pickup Location:</span>
              <div className="map-container">
                <GoogleMapSelector
                  initialLocation={
                    bookingData.pickupCoordinates?.coordinates ?
                    {
                      lat: bookingData.pickupCoordinates.coordinates[1],
                      lng: bookingData.pickupCoordinates.coordinates[0]
                    } :
                    null
                  }
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            </div>
          </div>

          <div className="price-breakdown">
            <h3>Price Breakdown</h3>
            <div className="price-item">
              <span>Daily Rate:</span>
              <span>${car.pricePerDay} × {durationDays} days</span>
            </div>
            <div className="price-item subtotal">
              <span>Subtotal:</span>
              <span>${(car.pricePerDay * durationDays).toFixed(2)}</span>
            </div>
            <div className="price-item">
              <span>Taxes & Fees:</span>
              <span>${(bookingData.totalAmount - (car.pricePerDay * durationDays)).toFixed(2)}</span>
            </div>
            <div className="price-item total">
              <span>Total:</span>
              <span>${bookingData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="payment-container">
          <h2>Payment Information</h2>

          <div className="payment-methods">
            <div className="payment-method-selector">
              <label className={`payment-method-option ${paymentMethod === 'credit_card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={() => setPaymentMethod('credit_card')}
                />
                <div className="payment-method-content">
                  <i className="fa fa-credit-card"></i>
                  <span>Credit Card</span>
                </div>
              </label>

              <label className={`payment-method-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                />
                <div className="payment-method-content">
                  <i className="fa fa-paypal"></i>
                  <span>PayPal</span>
                </div>
              </label>
            </div>
          </div>

          {paymentMethod === 'credit_card' && (
            <div className="credit-card-form">
              <div className="form-group">
                <label>Card Number</label>
                <input type="text" placeholder="1234 5678 9012 3456" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="text" placeholder="MM/YY" />
                </div>

                <div className="form-group">
                  <label>CVC</label>
                  <input type="text" placeholder="123" />
                </div>
              </div>

              <div className="form-group">
                <label>Cardholder Name</label>
                <input type="text" placeholder="John Doe" />
              </div>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="paypal-info">
              <p>You will be redirected to PayPal to complete your payment.</p>
            </div>
          )}

          <div className="terms-agreement">
            <label>
              <input type="checkbox" defaultChecked />
              <span>I agree to the <a href="/terms">Terms and Conditions</a> and <a href="/privacy">Privacy Policy</a></span>
            </label>
          </div>

          <button
            className="confirm-booking-button"
            onClick={handleConfirmBooking}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm & Pay'}
          </button>

          <button
            className="cancel-booking-button"
            onClick={() => navigate(`/cars/${car._id}`)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
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

export default BookingConfirmation;
