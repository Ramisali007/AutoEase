// booking.service.js
import api from './api';

/**
 * Get all bookings for the current user
 * @returns {Promise<Array>} Array of bookings
 */
const getUserBookings = async () => {
  try {
    console.log('Fetching user bookings...');
    const response = await api.get('/bookings');
    console.log('Bookings fetched successfully:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    
    // Return empty array instead of throwing an error
    console.log('Returning empty bookings array due to error');
    return [];
  }
};

/**
 * Get a specific booking by ID
 * @param {string} id Booking ID
 * @returns {Promise<Object>} Booking object
 */
const getBooking = async (id) => {
  try {
    console.log(`Fetching booking with ID: ${id}`);
    const response = await api.get(`/bookings/${id}`);
    console.log('Booking fetched successfully');
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking ${id}:`, error);
    
    // Return null instead of throwing an error
    return null;
  }
};

/**
 * Create a new booking
 * @param {Object} bookingData Booking data
 * @returns {Promise<Object>} Created booking
 */
const createBooking = async (bookingData) => {
  try {
    console.log('Creating new booking with data:', bookingData);
    const response = await api.post('/bookings', bookingData);
    console.log('Booking created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Update booking status
 * @param {string} id Booking ID
 * @param {string} status New status
 * @returns {Promise<Object>} Updated booking
 */
const updateBookingStatus = async (id, status) => {
  try {
    console.log(`Updating booking ${id} status to ${status}`);
    const response = await api.put(`/bookings/${id}`, { bookingStatus: status });
    console.log('Booking status updated successfully');
    return response.data;
  } catch (error) {
    console.error(`Error updating booking ${id} status:`, error);
    throw error;
  }
};

/**
 * Process payment for a booking
 * @param {string} id Booking ID
 * @param {Object} paymentDetails Payment details
 * @returns {Promise<Object>} Payment result
 */
const processPayment = async (id, paymentDetails) => {
  try {
    console.log(`Processing payment for booking ${id}`);
    const response = await api.post(`/bookings/${id}/payment`, paymentDetails);
    console.log('Payment processed successfully');
    return response.data;
  } catch (error) {
    console.error(`Error processing payment for booking ${id}:`, error);
    throw error;
  }
};

/**
 * Generate contract for a booking
 * @param {string} id Booking ID
 * @returns {Promise<Blob>} Contract PDF as blob
 */
const generateContract = async (id) => {
  try {
    console.log(`Generating contract for booking ${id}`);
    const response = await api.get(`/bookings/${id}/contract`, {
      responseType: 'blob'
    });
    console.log('Contract generated successfully');
    return response.data;
  } catch (error) {
    console.error(`Error generating contract for booking ${id}:`, error);
    throw error;
  }
};

const BookingService = {
  getUserBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  processPayment,
  generateContract
};

export default BookingService;
