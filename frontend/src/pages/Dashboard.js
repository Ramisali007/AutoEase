import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import api from '../services/api';
import axios from 'axios';
import BookingService from '../services/booking.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faCar,
  faCalendarCheck,
  faDollarSign,
  faEdit,
  faHistory,
  faCheck,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import CustomModal from '../components/CustomModal';
import UserChatSection from '../components/UserChatSection';
import '../assets/Dashboard.css';

const Dashboard = () => {
  // Hooks and state declarations
  const { currentUser } = useAuth();
  const { admins } = useChat();
  const navigate = useNavigate();
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChatSection, setShowChatSection] = useState(false);

  // Profile edit state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    driverLicense: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Effect for fixing user data if needed
  useEffect(() => {
    // Get user from localStorage
    const rawUserData = localStorage.getItem('user');
    if (rawUserData) {
      const parsedUser = JSON.parse(rawUserData);

      // Fix "John Doe" issue
      if (parsedUser && parsedUser.name === 'John Doe') {
        parsedUser.name = 'User';
        localStorage.setItem('user', JSON.stringify(parsedUser));
        window.location.reload();
      }
    }
  }, [currentUser]);

  // Effect for fetching the latest user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch the latest user data from the API
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Fetched latest user data:', response.data);

        // Update the user data in localStorage
        if (response.data) {
          // Preserve the token when updating user data
          const updatedUser = {
            ...response.data,
            token
          };

          localStorage.setItem('user', JSON.stringify(updatedUser));
          console.log('Updated user data in localStorage');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Effect for fetching bookings and handling role-based redirects
  useEffect(() => {
    // Redirect admin users to the admin dashboard
    if (currentUser && currentUser.role === 'admin') {
      navigate('/admin');
      return;
    }

    // Redirect host users to the host dashboard
    if (currentUser && currentUser.role === 'host') {
      navigate('/host');
      return;
    }

    const fetchBookings = async () => {
      try {
        console.log('Fetching bookings using BookingService...');

        // Use our new BookingService instead of direct API call
        const bookings = await BookingService.getUserBookings();

        console.log('Bookings fetched:', bookings.length);

        // Process bookings into active and past categories
        const active = [];
        const past = [];

        // Handle case where bookings is null or undefined
        if (Array.isArray(bookings)) {
          bookings.forEach(booking => {
            try {
              // Format the booking data for display
              const formattedBooking = {
                id: booking._id,
                carName: booking.car ? `${booking.car.brand} ${booking.car.model} (${booking.car.year})` : 'Unknown Car',
                startDate: new Date(booking.startDate).toLocaleDateString(),
                endDate: new Date(booking.endDate).toLocaleDateString(),
                totalAmount: booking.totalAmount || 0,
                status: booking.bookingStatus || 'Unknown'
              };

              // Categorize bookings
              if (booking.bookingStatus === 'Active') {
                active.push(formattedBooking);
              } else if (booking.bookingStatus === 'Completed') {
                past.push(formattedBooking);
              }
            } catch (formatError) {
              console.error('Error formatting booking:', formatError);
              // Skip this booking if there's an error formatting it
            }
          });
        } else {
          console.log('No bookings returned or invalid bookings data');
        }

        console.log('Active bookings:', active.length);
        console.log('Past bookings:', past.length);

        setActiveBookings(active);
        setPastBookings(past);
      } catch (err) {
        console.error('Error in fetchBookings:', err);
        // Don't show error to user, just log it
        // setError('Failed to fetch bookings: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser, navigate]);

  // Calculate total spent
  const calculateTotalSpent = () => {
    return [...activeBookings, ...pastBookings].reduce((total, booking) => total + (booking.totalAmount || 0), 0).toFixed(2);
  };

  // Navigate to the dedicated Profile page instead of opening a modal
  const handleEditProfile = () => {
    // Navigate to the Profile page
    navigate('/profile');
  };

  // Handle closing the profile edit modal
  const handleCloseModal = () => {
    setShowProfileModal(false);
    setError('');
    setSuccessMessage('');
  };

  // Handle password change modal
  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFormData({
      ...passwordFormData,
      [name]: value
    });
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setIsChangingPassword(true);

    // Validate passwords
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsChangingPassword(false);
      return;
    }

    try {
      // Get user ID from localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = storedUser._id || currentUser?._id;

      if (!userId) {
        setPasswordError('User ID not found. Please log in again.');
        setIsChangingPassword(false);
        return;
      }

      // Prepare data for the API call
      const passwordData = {
        userId: userId,
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      };

      console.log('Sending password change request with data:', passwordData);

      // Make API call to the standalone password change server
      const response = await axios.post('http://localhost:5001/change-password', passwordData);
      console.log('Password change response:', response.data);

      // Show success message
      if (response.data.success) {
        setPasswordSuccess(response.data.message || 'Password changed successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }

      // Clear form
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Close modal after a delay and show notification
      setTimeout(() => {
        closePasswordModal();
        showSavedNotification('Password updated successfully!');
      }, 2000);
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`);
    setProfileFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      console.log('Updated form data:', newData);
      return newData;
    });
  };

  // Show notification
  const showSavedNotification = (message) => {
    setSuccessMessage(message);
    setShowNotification(true);

    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      console.log('Submitting profile data:', profileFormData);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token for profile update:', token ? 'Present' : 'Missing');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Log the request details
      console.log('Making profile update request to:', '/users/profile');
      console.log('With headers:', headers);
      console.log('With data:', profileFormData);

      // Make API call to update profile
      const response = await api.put('/users/profile', profileFormData, { headers });
      console.log('Profile update response:', response.data);

      // Update the current user in localStorage
      if (response.data) {
        // Get the current user from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

        // Update the user data
        const updatedUser = {
          ...storedUser,
          name: profileFormData.name,
          phone: profileFormData.phone,
          address: profileFormData.address,
          driverLicense: profileFormData.driverLicense
        };

        // Save back to localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Close the modal
        setShowProfileModal(false);

        // Show notification
        showSavedNotification('Profile updated successfully!');

        // Reload the page after a short delay to refresh user data
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);

      // Log detailed error information
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      } else if (err.request) {
        console.error('Error request:', err.request);
      }

      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-dashboard-container">
      <div className="user-header">
        <div className="user-header-content">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome, {currentUser?.name || 'User'}! Manage your bookings and account information.</p>
          </div>
          <div className="user-profile">
            <div className="user-profile-info">
              <h3>{currentUser?.name || 'User'}</h3>
              <p>{currentUser?.email || 'user@example.com'}</p>
              {currentUser?.role === 'host' && (
                <div className="user-role-badge">Host</div>
              )}
            </div>
            <button className="btn-edit profile-edit-btn" onClick={handleEditProfile}>
              <FontAwesomeIcon icon={faEdit} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="user-stats">
        <div className="stat-card">
          <h3><FontAwesomeIcon icon={faCalendarCheck} /> Active Bookings</h3>
          <p className="stat-number">{activeBookings.length || 0}</p>
          <p className="stat-detail">Current rentals</p>
        </div>
        <div className="stat-card">
          <h3><FontAwesomeIcon icon={faHistory} /> Past Bookings</h3>
          <p className="stat-number">{pastBookings.length || 0}</p>
          <p className="stat-detail">Completed rentals</p>
        </div>
        <div className="stat-card">
          <h3><FontAwesomeIcon icon={faDollarSign} /> Total Spent</h3>
          <p className="stat-number">${calculateTotalSpent()}</p>
          <p className="stat-detail">On all bookings</p>
        </div>
        <div
          className="stat-card chat-stat-card"
          onClick={() => setShowChatSection(!showChatSection)}
          style={{
            cursor: 'pointer',
            borderTop: '4px solid #4361ee',
            transition: 'all 0.3s ease'
          }}
        >
          <h3><FontAwesomeIcon icon={faComments} style={{ color: '#4361ee' }} /> Chat</h3>
          <p className="stat-number" style={{ color: '#4361ee' }}>{admins.length || 0}</p>
          <p className="stat-detail">View chat messages</p>
        </div>
      </div>

      <div className="user-sections">
        {showChatSection ? (
          <div className="user-section chat-section">
            <div className="section-header" style={{ borderBottom: '1px solid rgba(67, 97, 238, 0.3)' }}>
              <h2>
                <FontAwesomeIcon icon={faComments} style={{ color: '#4361ee', marginRight: '10px' }} />
                Chat with Administrators & Hosts
              </h2>
              <button
                className="close-section"
                onClick={() => setShowChatSection(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6c757d'
                }}
              >
                ×
              </button>
            </div>
            <UserChatSection />
          </div>
        ) : (
          <div className="user-section">
            <div className="section-header">
              <h2><FontAwesomeIcon icon={faCar} /> Your Bookings</h2>
            </div>
          <div className="booking-cards">
            {activeBookings.length === 0 && pastBookings.length === 0 ? (
              <div className="no-bookings-message">
                <p>You don't have any bookings yet. Start exploring our cars to make your first booking!</p>
                <Link to="/cars" className="explore-cars-btn">Explore Cars</Link>
              </div>
            ) : (
              <>
                {activeBookings.length > 0 && (
                  <div className="booking-section">
                    <h3>Active Bookings</h3>
                    <div className="booking-list">
                      {activeBookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                          <h4>{booking.carName}</h4>
                          <p><strong>Dates:</strong> {booking.startDate} to {booking.endDate}</p>
                          <p><strong>Total:</strong> ${booking.totalAmount}</p>
                          <p><strong>Status:</strong> <span className="status-active">{booking.status}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pastBookings.length > 0 && (
                  <div className="booking-section">
                    <h3>Past Bookings</h3>
                    <div className="booking-list">
                      {pastBookings.map(booking => (
                        <div key={booking.id} className="booking-card">
                          <h4>{booking.carName}</h4>
                          <p><strong>Dates:</strong> {booking.startDate} to {booking.endDate}</p>
                          <p><strong>Total:</strong> ${booking.totalAmount}</p>
                          <p><strong>Status:</strong> <span className="status-completed">{booking.status}</span></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      <CustomModal
        show={showProfileModal}
        onClose={handleCloseModal}
        title="Edit Your Profile"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profileEditForm"
              className="btn btn-primary"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <form id="profileEditForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              type="text"
              name="name"
              value={profileFormData.name || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={profileFormData.email || ''}
              onChange={handleInputChange}
              disabled
              required
            />
            <small className="form-text text-muted">Email cannot be changed for security reasons.</small>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-control"
              type="tel"
              name="phone"
              value={profileFormData.phone || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              className="form-control"
              name="address"
              value={profileFormData.address || ''}
              onChange={handleInputChange}
              rows="2"
            ></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Driver License Number</label>
            <input
              className="form-control"
              type="text"
              name="driverLicense"
              value={profileFormData.driverLicense || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={(e) => {
                e.preventDefault();
                openPasswordModal();
              }}
            >
              Change Password
            </button>
          </div>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>
      </CustomModal>

      {/* Password Change Modal */}
      <CustomModal
        show={showPasswordModal}
        onClose={closePasswordModal}
        title="Change Your Password"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={closePasswordModal}
              disabled={isChangingPassword}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="passwordChangeForm"
              className="btn btn-primary"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </>
        }
      >
        <form id="passwordChangeForm" onSubmit={handlePasswordSubmit}>
          {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}
          {passwordError && <div className="alert alert-danger">{passwordError}</div>}

          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordFormData.currentPassword}
              onChange={handlePasswordChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordFormData.newPassword}
              onChange={handlePasswordChange}
              className="form-control"
              minLength="6"
              required
            />
            <small className="form-text text-muted">Password must be at least 6 characters long.</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordFormData.confirmPassword}
              onChange={handlePasswordChange}
              className="form-control"
              minLength="6"
              required
            />
          </div>
        </form>
      </CustomModal>

      {/* Notification */}
      {showNotification && (
        <div className="notification-toast">
          <div className="notification-content">
            <div className="notification-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <div className="notification-message">
              {successMessage}
              <div className="notification-submessage">
                Your changes have been saved to the database
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
