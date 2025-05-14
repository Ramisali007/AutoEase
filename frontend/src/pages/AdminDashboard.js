import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import api from '../services/api';
import axios from 'axios';
import SubscriberService from '../services/subscriber.service';
import ContactService from '../services/contact.service';
import CustomModal from '../components/CustomModal';
import GoogleMapSelector from '../components/GoogleMapSelector';
import SearchBar from '../components/SearchBar';
import AdminChatSection from '../components/AdminChatSection';
import CarImageUpload from '../components/CarImageUpload';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faCar,
  faCalendarCheck,
  faEye,
  faEdit,
  faTrash,
  faDatabase,
  faEnvelope,
  faNewspaper,
  faMessage,
  faMapMarkerAlt,
  faSearch,
  faCalendarAlt,
  faCheckCircle,
  faComments,
  faPlus,
  faInfoCircle,
  faTags,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import '../assets/AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Search states
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [carSearchTerm, setCarSearchTerm] = useState('');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [reviewSearchTerm, setReviewSearchTerm] = useState('');
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [chatSearchTerm, setChatSearchTerm] = useState('');

  // Active section state
  const [activeSection, setActiveSection] = useState(null);

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(''); // 'user', 'car', 'booking', 'review', or 'contact'
  const [editFormData, setEditFormData] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    // Check if user is logged in and is an admin
    console.log('Current user:', currentUser);

    // Redirect if not logged in or not an admin
    if (!currentUser) {
      console.log('No user logged in, redirecting to login');
      navigate('/login');
      return;
    } else if (currentUser.role !== 'admin') {
      console.log('User is not admin, redirecting to home');
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);

        // Get token if available
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        console.log('Fetching admin data with token:', !!token);

        // Fetch subscribers data
        try {
          const subscribersResponse = await SubscriberService.getAllSubscribers();
          console.log('Subscribers data:', subscribersResponse);

          if (subscribersResponse.fromLocalStorage) {
            setSubscribers(subscribersResponse.data);
          } else if (subscribersResponse.data && Array.isArray(subscribersResponse.data)) {
            setSubscribers(subscribersResponse.data);
          } else if (subscribersResponse.data && Array.isArray(subscribersResponse.data.data)) {
            setSubscribers(subscribersResponse.data.data);
          } else {
            setSubscribers([]);
          }
        } catch (subscribersErr) {
          console.error('Error fetching subscribers:', subscribersErr);
          // Fallback to localStorage
          const localSubscribers = SubscriberService.getFromLocalStorage();
          setSubscribers(localSubscribers.map(email => ({ email, subscriptionDate: new Date() })));
        }

        try {
          // Fetch users data from database
          const usersResponse = await api.get('/admin/users', { headers });
          console.log('Users data:', usersResponse.data);
          setUsers(usersResponse.data || []);
        } catch (userErr) {
          console.error('Error fetching users:', userErr);
          setError('Failed to fetch users: ' + (userErr.response?.data?.message || userErr.message));
          setUsers([]);
        }

        try {
          // Fetch cars data from database
          const carsResponse = await api.get('/cars', { headers }); // Use the public cars endpoint
          console.log('Cars response:', carsResponse);

          // The cars endpoint returns { count, data } structure
          if (carsResponse.data && carsResponse.data.data) {
            console.log('Cars data array:', carsResponse.data.data);
            setCars(carsResponse.data.data); // Use the data array from the response
          } else if (Array.isArray(carsResponse.data)) {
            console.log('Direct cars array:', carsResponse.data);
            setCars(carsResponse.data);
          } else {
            console.log('No cars found or unexpected format');
            setCars([]);
          }
        } catch (carErr) {
          console.error('Error fetching cars:', carErr);
          setError('Failed to fetch cars: ' + (carErr.response?.data?.message || carErr.message));
          setCars([]);
        }

        try {
          // Fetch bookings data from database
          const bookingsResponse = await api.get('/admin/bookings', { headers });
          console.log('Bookings data:', bookingsResponse.data);
          setBookings(bookingsResponse.data || []);
        } catch (bookingErr) {
          console.error('Error fetching bookings:', bookingErr);
          setError('Failed to fetch bookings: ' + (bookingErr.response?.data?.message || bookingErr.message));
          setBookings([]);
        }

        try {
          // Fetch reviews data directly from the reviews endpoint
          console.log('Fetching reviews from /api/reviews');
          const reviewsResponse = await api.get('/reviews', { headers });
          console.log('Reviews data:', reviewsResponse.data);
          setReviews(reviewsResponse.data || []);
        } catch (reviewErr) {
          console.error('Error fetching reviews:', reviewErr);
          // Don't show error message, just set empty reviews
          setReviews([]);
        }

        try {
          // Fetch contact messages
          console.log('Fetching contact messages from /api/contact');
          const contactResponse = await ContactService.getAllContactMessages();
          console.log('Contact messages data:', contactResponse);

          if (contactResponse.fromLocalStorage) {
            setContactMessages(contactResponse.data);
          } else if (contactResponse.data && Array.isArray(contactResponse.data)) {
            setContactMessages(contactResponse.data);
          } else if (contactResponse.data && Array.isArray(contactResponse.data.data)) {
            setContactMessages(contactResponse.data.data);
          } else {
            setContactMessages([]);
          }
        } catch (contactErr) {
          console.error('Error fetching contact messages:', contactErr);
          // Fallback to localStorage
          const localContactMessages = ContactService.getFromLocalStorage();
          setContactMessages(localContactMessages);
        }
      } catch (err) {
        setError('Failed to fetch admin data: ' + (err.response?.data?.message || err.message));
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser, navigate]);

  // Handle view button click
  const handleView = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setShowViewModal(true);
  };

  // Handle edit button click
  const handleEdit = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setEditFormData(item);
    setShowEditModal(true);
  };

  // Handle add car button click
  const handleAddCar = () => {
    setEditFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      type: 'Sedan',
      fuelType: 'Petrol',
      transmission: 'Automatic',
      seatingCapacity: 5,
      pricePerDay: 50,
      mileage: 0,
      features: [],
      images: [], // Empty array for images, will be populated by CarImageUpload
      location: {
        address: '',
        coordinates: {
          type: 'Point',
          coordinates: [0, 0]
        }
      },
      isAvailable: true
    });
    setShowAddCarModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowAddCarModal(false);
    setSelectedItem(null);
    setItemType('');
    setIsDeleting(false);
  };

  // Handle delete button click
  const handleDelete = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedItem || !itemType) return;

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let response;

      switch (itemType) {
        case 'user':
          response = await api.delete(`/admin/users/${selectedItem._id}`, { headers });
          if (response.data) {
            setUsers(users.filter(user => user._id !== selectedItem._id));
            showSavedNotification('User deleted successfully');
          }
          break;

        case 'car':
          response = await api.delete(`/admin/cars/${selectedItem._id}`, { headers });
          if (response.data) {
            setCars(cars.filter(car => car._id !== selectedItem._id));
            showSavedNotification('Car deleted successfully');
          }
          break;

        case 'booking':
          // Delete the booking from the database
          response = await api.delete(`/admin/bookings/${selectedItem._id}`, { headers });
          if (response.data) {
            setBookings(bookings.filter(booking => booking._id !== selectedItem._id));
            showSavedNotification('Booking deleted successfully');
          }
          break;

        case 'review':
          response = await api.delete(`/admin/reviews/${selectedItem._id}`, { headers });
          if (response.data) {
            setReviews(reviews.filter(review => review._id !== selectedItem._id));
            showSavedNotification('Review deleted successfully');
          }
          break;

        case 'contact':
          response = await api.delete(`/contact/${selectedItem._id}`, { headers });
          if (response.data) {
            setContactMessages(contactMessages.filter(message =>
              message._id !== selectedItem._id
            ));
            showSavedNotification('Message deleted successfully');
          }
          break;

        default:
          throw new Error('Invalid item type');
      }

      handleCloseModal();
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      setError(`Failed to delete ${itemType}: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
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
      // Get user ID from localStorage or currentUser
      const userId = currentUser?._id;

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

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  // Handle location selection from map
  const handleLocationSelect = (locationData) => {
    console.log('Location selected:', locationData);
    setEditFormData({
      ...editFormData,
      location: {
        address: locationData.address,
        coordinates: locationData.coordinates
      }
    });
  };

  // Handle car image upload success
  const handleCarImageUploadSuccess = (images) => {
    console.log('Car images uploaded successfully:', images);
    setEditFormData({
      ...editFormData,
      images: images
    });
  };

  // Handle car image removal
  const handleRemoveCarImage = (index) => {
    const updatedImages = [...editFormData.images];
    updatedImages.splice(index, 1);
    setEditFormData({
      ...editFormData,
      images: updatedImages
    });
  };

  // Handle add car form submission
  const handleAddCarSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['brand', 'model', 'year', 'type', 'fuelType', 'transmission', 'seatingCapacity', 'pricePerDay'];
    const missingFields = requiredFields.filter(field => !editFormData[field]);

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate that at least one image is uploaded
    if (!editFormData.images || editFormData.images.length === 0) {
      setError('Please upload at least one car image');
      return;
    }

    try {
      // Show loading state
      setLoading(true);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log("Adding new car:", editFormData);

      // Ensure location coordinates are properly formatted
      const carData = {
        ...editFormData,
        location: {
          address: editFormData.location?.address || '',
          coordinates: {
            type: 'Point',
            coordinates: editFormData.location?.coordinates?.coordinates || [0, 0]
          }
        }
      };

      const response = await api.post('/admin/cars', carData, { headers });
      console.log("Add car response:", response);

      // Add the new car to the cars state
      setCars([...cars, response.data]);

      // Close the modal
      handleCloseModal();

      // Clear any previous error messages
      setError('');

      // Show success message
      setSuccessMessage('Car added successfully! The car has been saved to the database.');

      // Show notification
      setNotificationMessage('Car added successfully! The car is now available for rent.');
      setShowNotification(true);

      // Clear notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      console.error('Error adding car:', err);
      setError('Failed to add car: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Navigate to the dedicated Profile page instead of opening a modal
  const handleEditProfile = () => {
    // Navigate to the Profile page
    navigate('/profile');
  };

  // Search filter functions
  const getFilteredUsers = () => {
    if (!userSearchTerm) return users;

    return users.filter(user => {
      const searchLower = userSearchTerm.toLowerCase();
      return (
        (user.name && user.name.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.role && user.role.toLowerCase().includes(searchLower))
      );
    });
  };

  const getFilteredCars = () => {
    if (!carSearchTerm) return cars;

    return cars.filter(car => {
      const searchLower = carSearchTerm.toLowerCase();
      return (
        (car.brand && car.brand.toLowerCase().includes(searchLower)) ||
        (car.model && car.model.toLowerCase().includes(searchLower)) ||
        (car.year && car.year.toString().includes(searchLower)) ||
        (car.type && car.type.toLowerCase().includes(searchLower))
      );
    });
  };

  const getFilteredBookings = () => {
    if (!bookingSearchTerm) return bookings;

    return bookings.filter(booking => {
      const searchLower = bookingSearchTerm.toLowerCase();
      return (
        (booking.user?.name && booking.user.name.toLowerCase().includes(searchLower)) ||
        (booking.car?.brand && booking.car.brand.toLowerCase().includes(searchLower)) ||
        (booking.car?.model && booking.car.model.toLowerCase().includes(searchLower)) ||
        (booking.bookingStatus && booking.bookingStatus.toLowerCase().includes(searchLower)) ||
        (booking.invoiceNumber && booking.invoiceNumber.toLowerCase().includes(searchLower))
      );
    });
  };

  const getFilteredReviews = () => {
    if (!reviewSearchTerm) return reviews;

    return reviews.filter(review => {
      const searchLower = reviewSearchTerm.toLowerCase();
      return (
        (review.user?.name && review.user.name.toLowerCase().includes(searchLower)) ||
        (review.car?.brand && review.car.brand.toLowerCase().includes(searchLower)) ||
        (review.car?.model && review.car.model.toLowerCase().includes(searchLower)) ||
        (review.comment && review.comment.toLowerCase().includes(searchLower)) ||
        (review.rating && review.rating.toString().includes(searchLower))
      );
    });
  };

  const getFilteredMessages = () => {
    if (!messageSearchTerm) return contactMessages;

    return contactMessages.filter(message => {
      const searchLower = messageSearchTerm.toLowerCase();
      return (
        (message.name && message.name.toLowerCase().includes(searchLower)) ||
        (message.email && message.email.toLowerCase().includes(searchLower)) ||
        (message.subject && message.subject.toLowerCase().includes(searchLower)) ||
        (message.message && message.message.toLowerCase().includes(searchLower))
      );
    });
  };

  // Get active bookings
  const getActiveBookings = () => {
    return bookings.filter(booking => booking.bookingStatus === 'Active');
  };

  // Filter active bookings based on search term
  const getFilteredActiveBookings = () => {
    const activeBookings = getActiveBookings();
    if (!bookingSearchTerm) return activeBookings;

    return activeBookings.filter(booking => {
      const searchLower = bookingSearchTerm.toLowerCase();
      return (
        (booking.user?.name && booking.user.name.toLowerCase().includes(searchLower)) ||
        (booking.car?.brand && booking.car.brand.toLowerCase().includes(searchLower)) ||
        (booking.car?.model && booking.car.model.toLowerCase().includes(searchLower)) ||
        (booking.invoiceNumber && booking.invoiceNumber.toLowerCase().includes(searchLower))
      );
    });
  };

  // Function to fetch users data
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log('Fetching updated users data from the database...');
      const usersResponse = await api.get('/admin/users', { headers });
      console.log('Updated users data:', usersResponse.data);

      // Update the users state with the fresh data from the database
      setUsers(usersResponse.data || []);

      return usersResponse.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return null;
    }
  };

  // Show notification
  const showSavedNotification = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);

    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if we're changing a user's role and confirm the action
    if (itemType === 'user' && selectedItem && selectedItem.role !== editFormData.role) {
      // Ask for confirmation before changing role
      if (!window.confirm(`Are you sure you want to change this user's role from "${selectedItem.role}" to "${editFormData.role}"? This will affect their permissions and access throughout the system.`)) {
        return; // User cancelled the action
      }
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let response;

      if (itemType === 'profile') {
        // If editing own profile (use admin route to update the user)
        if (currentUser && currentUser._id) {
          console.log(`Updating profile for user ID: ${currentUser._id}`);
          console.log("Update data:", editFormData);

          try {
            // Use the admin users endpoint to update the profile
            response = await api.put(`/admin/users/${currentUser._id}`, editFormData, { headers });
            console.log("Profile update response:", response);

            // Update the current user in local state
            if (response.data) {
              // Update the current user in localStorage to reflect changes
              const token = localStorage.getItem('token');
              const updatedUser = { ...response.data, token };
              localStorage.setItem('currentUser', JSON.stringify(updatedUser));

              // Close the modal
              handleCloseModal();

              // Show notification
              showSavedNotification('Profile updated successfully!');

              // Clear any previous error
              setError('');

              // Reload the page after a short delay to refresh user data
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            }
          } catch (error) {
            console.error("Profile update error:", error);

            // Re-throw the error to be caught by the outer catch block
            throw error;
          }

          return;
        } else {
          console.error("User ID not found in currentUser:", currentUser);
          throw new Error('User ID not found');
        }
      } else if (itemType === 'user') {
        console.log(`Updating user with ID: ${selectedItem._id}`);
        console.log("User update data:", editFormData);

        // Log role change specifically if it's being updated
        if (selectedItem.role !== editFormData.role) {
          console.log(`Role change detected: ${selectedItem.role} -> ${editFormData.role}`);
        }

        try {
          // Use the admin users endpoint to update the user
          response = await api.put(`/admin/users/${selectedItem._id}`, editFormData, { headers });
          console.log("User update response:", response);

          // Verify the role was updated in the response
          if (selectedItem.role !== response.data.role) {
            console.log(`Role successfully changed in response: ${selectedItem.role} -> ${response.data.role}`);
          }

          // Update users state with the edited user
          setUsers(users.map(user =>
            user._id === selectedItem._id ? response.data : user
          ));

          // Show special notification for role changes
          if (selectedItem.role !== editFormData.role) {
            showSavedNotification(`User role changed from ${selectedItem.role} to ${editFormData.role}`);

            // Add a more detailed notification about database update
            setTimeout(() => {
              showSavedNotification(`User ${response.data.name}'s role has been updated in the database`);
            }, 3000);

            // Refresh the users data to ensure we have the latest data from the database
            fetchUsers();
          }
        } catch (error) {
          console.error("User update error:", error);

          // Re-throw the error to be caught by the outer catch block
          throw error;
        }
      } else if (itemType === 'car') {
        console.log(`Updating car with ID: ${selectedItem._id}`);
        console.log("Car update data:", editFormData);

        try {
          // Use the admin cars endpoint to update the car
          response = await api.put(`/admin/cars/${selectedItem._id}`, editFormData, { headers });
          console.log("Car update response:", response);

          // Update cars state with the edited car
          setCars(cars.map(car =>
            car._id === selectedItem._id ? response.data : car
          ));
        } catch (error) {
          console.error("Car update error:", error);

          // Re-throw the error to be caught by the outer catch block
          throw error;
        }
      } else if (itemType === 'booking') {
        console.log(`Updating booking with ID: ${selectedItem._id}`);
        console.log("Booking update data:", editFormData);

        try {
          // Use the admin bookings endpoint to update the booking
          response = await api.put(`/admin/bookings/${selectedItem._id}`, editFormData, { headers });
          console.log("Booking update response:", response);

          // Update bookings state with the edited booking
          setBookings(bookings.map(booking =>
            booking._id === selectedItem._id ? response.data : booking
          ));
        } catch (error) {
          console.error("Booking update error:", error);

          // Re-throw the error to be caught by the outer catch block
          throw error;
        }
      } else if (itemType === 'review') {
        console.log(`Updating review with ID: ${selectedItem._id}`);
        console.log("Review update data:", editFormData);

        try {
          // Use the reviews endpoint to update the review
          response = await api.put(`/reviews/${selectedItem._id}`, editFormData, { headers });
          console.log("Review update response:", response);

          // Update reviews state with the edited review
          setReviews(reviews.map(review =>
            review._id === selectedItem._id ? response.data : review
          ));
        } catch (error) {
          console.error("Review update error:", error);

          // Re-throw the error to be caught by the outer catch block
          throw error;
        }
      }

      // Close the modal
      handleCloseModal();

      // Clear any previous error messages
      setError('');

      // Show success message
      setSuccessMessage(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} updated successfully!`);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

      console.log('Item updated successfully:', response.data);
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {currentUser?.name || 'Admin'}! Manage users, cars, and bookings with ease.</p>
          </div>
          <div className="admin-profile">
            <div className="admin-profile-info">
              <h3>{currentUser?.name || 'Admin'}</h3>
              <p>{currentUser?.email || 'admin@example.com'}</p>
            </div>
            <button className="btn-edit profile-edit-btn" onClick={handleEditProfile}>
              <FontAwesomeIcon icon={faEdit} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* Floating Notification */}
      {showNotification && (
        <div className="notification-toast">
          <div className="notification-content">
            <div className="notification-icon">✓</div>
            <div className="notification-message">
              {notificationMessage}
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '4px' }}>
                {notificationMessage.includes('deleted successfully')
                  ? 'Item has been removed from the database'
                  : 'Your changes have been saved to the database'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-stats">
        <div
          className={`stat-card ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => setActiveSection('users')}
        >
          <h3><FontAwesomeIcon icon={faUsers} /> Total Users</h3>
          <p className="stat-number">{users.length}</p>
          <p className="stat-detail">View users</p>
        </div>
        <div
          className={`stat-card ${activeSection === 'cars' ? 'active' : ''}`}
          onClick={() => setActiveSection('cars')}
        >
          <h3><FontAwesomeIcon icon={faCar} /> Total Cars</h3>
          <p className="stat-number">{cars.length || 0}</p>
          {cars.length > 0 && (
            <p className="stat-detail">
              {cars.filter(car => car.isAvailable).length} available
            </p>
          )}
        </div>
        <div
          className={`stat-card ${activeSection === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveSection('bookings')}
        >
          <h3><FontAwesomeIcon icon={faCalendarCheck} /> Total Bookings</h3>
          <p className="stat-number">{bookings.length}</p>
          <p className="stat-detail">View bookings</p>
        </div>
        <div
          className={`stat-card ${activeSection === 'activeBookings' ? 'active' : ''}`}
          onClick={() => setActiveSection('activeBookings')}
          style={{ borderTop: '4px solid var(--success-color)' }}
        >
          <h3><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--success-color)' }} /> Active Bookings</h3>
          <p className="stat-number" style={{ color: 'var(--success-color)' }}>{getActiveBookings().length}</p>
          <p className="stat-detail">View active bookings</p>
        </div>
        <div
          className={`stat-card ${activeSection === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveSection('reviews')}
        >
          <h3><FontAwesomeIcon icon={faDatabase} /> Total Reviews</h3>
          <p className="stat-number">{reviews.length}</p>
          <p className="stat-detail">View reviews</p>
        </div>
        <div
          className={`stat-card ${activeSection === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveSection('contact')}
        >
          <h3><FontAwesomeIcon icon={faMessage} /> Contact Messages</h3>
          <p className="stat-number">{contactMessages.length}</p>
          <p className="stat-detail">View messages</p>
        </div>
        <div
          className={`stat-card ${activeSection === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveSection('chat')}
          style={{ borderTop: '4px solid #4361ee' }}
        >
          <h3><FontAwesomeIcon icon={faComments} style={{ color: '#4361ee' }} /> Chat</h3>
          <p className="stat-number" style={{ color: '#4361ee' }}>{users.length}</p>
          <p className="stat-detail">View chat messages</p>
        </div>
        <div
          className="stat-card"
          onClick={() => navigate('/admin/subscribers')}
          style={{ cursor: 'pointer' }}
        >
          <h3><FontAwesomeIcon icon={faNewspaper} /> Newsletter</h3>
          <p className="stat-number">
            {subscribers.length}
          </p>
          <p className="stat-detail">View subscribers</p>
        </div>
      </div>

      <div className="admin-sections">
        {activeSection === 'users' && (
          <div id="users-section" className="admin-section">
            <div className="section-header">
              <h2>Users <span className="count-badge">{users.length}</span></h2>
              <button className="close-section" onClick={() => setActiveSection(null)}>×</button>
            </div>
            <div className="section-controls">
              <SearchBar
                placeholder="Search users by name, email, or role..."
                onSearch={setUserSearchTerm}
                className="admin-search-bar"
              />
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredUsers().length > 0 ? (
                    getFilteredUsers().map(user => (
                      <tr key={user._id || `user-${Math.random()}`}>
                        <td>{user.name || 'Unknown User'}</td>
                        <td>{user.email || 'No Email'}</td>
                        <td>{user.role || 'user'}</td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => handleView(user, 'user')}
                          >
                            <FontAwesomeIcon icon={faEye} /> View
                          </button>
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(user, 'user')}
                          >
                            <FontAwesomeIcon icon={faEdit} /> Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(user, 'user')}
                          >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'cars' && (
          <div id="cars-section" className="admin-section">
            <div className="section-header">
              <h2>All Cars <span className="count-badge">{cars.length}</span></h2>
              <button className="close-section" onClick={() => setActiveSection(null)}>×</button>
            </div>
            <div className="section-controls">
              <div className="search-and-add">
                <SearchBar
                  placeholder="Search cars by brand, model, year..."
                  onSearch={setCarSearchTerm}
                  className="admin-search-bar"
                />
                <button className="btn-add" onClick={handleAddCar}>
                  <FontAwesomeIcon icon={faPlus} /> Add New Car
                </button>
              </div>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Year</th>
                    <th>Price/Day</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredCars().length > 0 ? (
                    getFilteredCars().map(car => (
                      <tr key={car._id || `car-${Math.random()}`}>
                        <td>{car.brand || 'Unknown Brand'}</td>
                        <td>{car.model || 'Unknown Model'}</td>
                        <td>{car.year || 'N/A'}</td>
                        <td>${car.pricePerDay || 0}/day</td>
                        <td>
                          <span className={`status-badge ${car.isAvailable ? 'available' : 'booked'}`}>
                            {car.isAvailable ? 'Available' : 'Booked'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => handleView(car, 'car')}
                          >
                            <FontAwesomeIcon icon={faEye} /> View
                          </button>
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(car, 'car')}
                          >
                            <FontAwesomeIcon icon={faEdit} /> Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(car, 'car')}
                          >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No cars found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'bookings' && (
          <div id="bookings-section" className="admin-section">
            <div className="section-header">
              <h2>Bookings <span className="count-badge">{bookings.length}</span></h2>
              <button className="close-section" onClick={() => setActiveSection(null)}>×</button>
            </div>
            <div className="section-controls">
              <SearchBar
                placeholder="Search bookings by user, car, or status..."
                onSearch={setBookingSearchTerm}
                className="admin-search-bar"
              />
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Car</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredBookings().length > 0 ? (
                    getFilteredBookings().map(booking => (
                      <tr key={booking._id || `booking-${Math.random()}`}>
                        <td>{booking.user?.name || 'Unknown User'}</td>
                        <td>{booking.car ? `${booking.car.brand} ${booking.car.model} (${booking.car.year})` : 'Unknown Car'}</td>
                        <td>
                          {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'} -
                          {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>{booking.bookingStatus || 'Pending'}</td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => handleView(booking, 'booking')}
                          >
                            <FontAwesomeIcon icon={faEye} /> View
                          </button>
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(booking, 'booking')}
                          >
                            <FontAwesomeIcon icon={faEdit} /> Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(booking, 'booking')}

                            title="This will permanently delete the booking from the database"
                          >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">No bookings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'activeBookings' && (
          <div id="active-bookings-section" className="admin-section" style={{ borderTop: '4px solid var(--success-color)' }}>
            <div className="section-header" style={{ borderBottom: '1px solid rgba(74, 222, 128, 0.3)' }}>
              <h2><FontAwesomeIcon icon={faCheckCircle} style={{ color: 'var(--success-color)', marginRight: '10px' }} /> Active Bookings <span className="count-badge" style={{ backgroundColor: 'var(--success-color)' }}>{getActiveBookings().length}</span></h2>
              <button className="close-section" onClick={() => setActiveSection(null)}>×</button>
            </div>
            <div className="section-controls">
              <SearchBar
                placeholder="Search active bookings by user, car, or invoice number..."
                onSearch={setBookingSearchTerm}
                className="admin-search-bar"
              />
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Car</th>
                    <th>Dates</th>
                    <th>Invoice #</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredActiveBookings().length > 0 ? (
                    getFilteredActiveBookings().map(booking => (
                      <tr key={booking._id || `booking-${Math.random()}`}>
                        <td>{booking.user?.name || 'Unknown User'}</td>
                        <td>{booking.car ? `${booking.car.brand} ${booking.car.model} (${booking.car.year})` : 'Unknown Car'}</td>
                        <td>
                          {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'} -
                          {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>{booking.invoiceNumber || 'N/A'}</td>
                        <td>${booking.totalAmount ? booking.totalAmount.toFixed(2) : '0.00'}</td>
                        <td>
                          <span className="status-badge available">Active</span>
                        </td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => handleView(booking, 'booking')}
                          >
                            <FontAwesomeIcon icon={faEye} /> View
                          </button>
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(booking, 'booking')}
                          >
                            <FontAwesomeIcon icon={faEdit} /> Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(booking, 'booking')}
                            title="This will permanently delete the booking from the database"
                          >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">No active bookings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'reviews' && (
          <div id="reviews-section" className="admin-section">
            <div className="section-header">
              <h2>Reviews <span className="count-badge">{reviews.length}</span></h2>
              <button className="close-section" onClick={() => setActiveSection(null)}>×</button>
            </div>
            <div className="section-controls">
              <SearchBar
                placeholder="Search reviews by user, car, or comment..."
                onSearch={setReviewSearchTerm}
                className="admin-search-bar"
              />
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Car</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredReviews().length > 0 ? (
                    getFilteredReviews().map(review => (
                      <tr key={review._id || `review-${Math.random()}`}>
                        <td>{review.user?.name || 'Unknown User'}</td>
                        <td>{review.car?.brand} {review.car?.model}</td>
                        <td>{review.rating} / 5</td>
                        <td>{review.comment.length > 50 ? `${review.comment.substring(0, 50)}...` : review.comment}</td>
                        <td>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => handleView(review, 'review')}
                          >
                            <FontAwesomeIcon icon={faEye} /> View
                          </button>
                          <button
                            className="btn-edit"
                            onClick={() => handleEdit(review, 'review')}
                          >
                            <FontAwesomeIcon icon={faEdit} /> Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(review, 'review')}
                          >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No reviews found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'contact' && (
          <div id="contact-section" className="admin-section">
            <div className="section-header">
              <h2>Contact Messages <span className="count-badge">{contactMessages.length}</span></h2>
              <button className="close-section" onClick={() => setActiveSection(null)}>×</button>
            </div>
            <div className="section-controls">
              <SearchBar
                placeholder="Search messages by name, email, or subject..."
                onSearch={setMessageSearchTerm}
                className="admin-search-bar"
              />
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredMessages().length > 0 ? (
                    getFilteredMessages().map(message => (
                      <tr key={message._id || message.id || `message-${Math.random()}`}>
                        <td>{message.name || 'Unknown'}</td>
                        <td>{message.email || 'No Email'}</td>
                        <td>{message.subject || 'No Subject'}</td>
                        <td>{message.message && message.message.length > 50
                          ? `${message.message.substring(0, 50)}...`
                          : message.message || 'No Message'}</td>
                        <td>{message.submissionDate
                          ? new Date(message.submissionDate).toLocaleDateString()
                          : 'N/A'}</td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => handleView(message, 'contact')}
                          >
                            <FontAwesomeIcon icon={faEye} /> View
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(message, 'contact')}
                          >
                            <FontAwesomeIcon icon={faTrash} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No contact messages found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'chat' && (
          <div id="chat-section" className="admin-section">
            <div className="section-header" style={{ borderBottom: '1px solid rgba(67, 97, 238, 0.3)' }}>
              <h2><FontAwesomeIcon icon={faComments} style={{ color: '#4361ee', marginRight: '10px' }} /> Chat Messages <span className="count-badge" style={{ backgroundColor: '#4361ee' }}>{users.length}</span></h2>
              <button className="close-section" onClick={() => setActiveSection(null)}>×</button>
            </div>
            <AdminChatSection />
          </div>
        )}

        {!activeSection && (
          <div className="admin-section no-section-selected">
            <div className="welcome-content">
              <h2>Welcome to the Admin Dashboard</h2>
              <p>Click on any card above to view detailed information about users, cars, bookings, reviews, contact messages, or chat.</p>
              <div className="welcome-icons">
                <FontAwesomeIcon icon={faUsers} />
                <FontAwesomeIcon icon={faCar} />
                <FontAwesomeIcon icon={faCalendarCheck} />
                <FontAwesomeIcon icon={faDatabase} />
                <FontAwesomeIcon icon={faMessage} />
                <FontAwesomeIcon icon={faComments} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <CustomModal
        show={showViewModal}
        onClose={handleCloseModal}
        title={
          itemType === 'user' ? 'User Details' :
          itemType === 'car' ? 'Car Details' :
          itemType === 'booking' ? 'Booking Details' :
          itemType === 'review' ? 'Review Details' :
          itemType === 'contact' ? 'Contact Message Details' : ''
        }
        footer={
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            <span>✕</span> Close
          </button>
        }
      >
        {selectedItem && (
          <div className="item-details">
            {itemType === 'user' && (
              <>
                <p><strong>Name:</strong> {selectedItem.name}</p>
                <p><strong>Email:</strong> {selectedItem.email}</p>
                <p><strong>Role:</strong> <span className={`role-badge ${selectedItem.role}`}>{selectedItem.role}</span></p>
                <p><strong>Phone:</strong> {selectedItem.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedItem.address || 'N/A'}</p>
                <p><strong>Driver License:</strong> {selectedItem.driverLicense || 'N/A'}</p>
                <p><strong>Created At:</strong> {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : 'N/A'}</p>

                {/* Show host-specific fields if the user is a host */}
                {selectedItem.role === 'host' && (
                  <div className="host-details">
                    <h4>Host Information</h4>
                    <p><strong>Host Bio:</strong> {selectedItem.hostBio || 'Not provided'}</p>
                    <p><strong>Hosting Experience:</strong> {selectedItem.hostingExperience || 'Beginner'}</p>
                    <p><strong>Preferred Payment Method:</strong> {selectedItem.preferredPaymentMethod || 'Not specified'}</p>
                    <p><strong>Host Setup Complete:</strong> {selectedItem.hostSetupComplete ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </>
            )}

            {itemType === 'car' && (
              <>
                <p><strong>Brand:</strong> {selectedItem.brand}</p>
                <p><strong>Model:</strong> {selectedItem.model}</p>
                <p><strong>Year:</strong> {selectedItem.year}</p>
                <p><strong>Type:</strong> {selectedItem.type}</p>
                <p><strong>Fuel Type:</strong> {selectedItem.fuelType}</p>
                <p><strong>Transmission:</strong> {selectedItem.transmission}</p>
                <p><strong>Seating Capacity:</strong> {selectedItem.seatingCapacity}</p>
                <p><strong>Price Per Day:</strong> ${selectedItem.pricePerDay}</p>
                <p><strong>Mileage:</strong> {selectedItem.mileage}</p>
                <p><strong>Status:</strong> {selectedItem.isAvailable ? 'Available' : 'Booked'}</p>
                <p><strong>Average Rating:</strong> {selectedItem.averageRating || 'No ratings yet'}</p>

                {selectedItem.features && selectedItem.features.length > 0 && (
                  <div>
                    <strong>Features:</strong>
                    <ul>
                      {selectedItem.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Display car images */}
                <div>
                  <strong>Images:</strong>
                  <div className="car-images">
                    {selectedItem.images && selectedItem.images.length > 0 ? (
                      selectedItem.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedItem.brand} ${selectedItem.model} - Image ${index + 1}`}
                          className="car-image-thumbnail"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/nissan.jpeg';
                          }}
                        />
                      ))
                    ) : (
                      <img
                        src={`/images/${selectedItem.brand?.toLowerCase() || 'nissan'}.jpeg`}
                        alt={`${selectedItem.brand} ${selectedItem.model}`}
                        className="car-image-thumbnail"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/nissan.jpeg';
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Display car location if available */}
                {selectedItem.location && selectedItem.location.coordinates && (
                  <div className="car-location">
                    <strong>Location:</strong>
                    <p>{selectedItem.location.address || 'Location set without address'}</p>
                    <GoogleMapSelector
                      initialLocation={{
                        lat: selectedItem.location.coordinates.coordinates[1],
                        lng: selectedItem.location.coordinates.coordinates[0]
                      }}
                      readOnly={true}
                      showSearchBox={false}
                    />
                  </div>
                )}
              </>
            )}

            {itemType === 'booking' && (
              <>
                <p><strong>User:</strong> {selectedItem.user?.name || 'Unknown User'}</p>
                <p><strong>Car:</strong> {selectedItem.car?.brand} {selectedItem.car?.model}</p>
                <p><strong>Start Date:</strong> {selectedItem.startDate ? new Date(selectedItem.startDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>End Date:</strong> {selectedItem.endDate ? new Date(selectedItem.endDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Pickup Location:</strong> {selectedItem.pickupLocation}</p>
                <p><strong>Total Amount:</strong> ${selectedItem.totalAmount}</p>
                <p><strong>Payment Status:</strong> {selectedItem.paymentStatus}</p>
                <p><strong>Booking Status:</strong> {selectedItem.bookingStatus}</p>
                <p><strong>Contract Generated:</strong> {selectedItem.contractGenerated ? 'Yes' : 'No'}</p>
                <p><strong>Created At:</strong> {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : 'N/A'}</p>
              </>
            )}

            {itemType === 'review' && (
              <>
                <p><strong>User:</strong> {selectedItem.user?.name || 'Unknown User'}</p>
                <p><strong>Car:</strong> {selectedItem.car?.brand} {selectedItem.car?.model}</p>
                <p><strong>Rating:</strong> {selectedItem.rating} / 5</p>
                <div className="review-comment">
                  <strong>Comment:</strong>
                  <p>{selectedItem.comment}</p>
                </div>
                <p><strong>Created At:</strong> {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : 'N/A'}</p>
                {selectedItem.updatedAt && (
                  <p><strong>Updated At:</strong> {new Date(selectedItem.updatedAt).toLocaleString()}</p>
                )}
              </>
            )}

            {itemType === 'contact' && (
              <>
                <p><strong>Name:</strong> {selectedItem.name}</p>
                <p><strong>Email:</strong> {selectedItem.email}</p>
                <p><strong>Phone:</strong> {selectedItem.phone || 'N/A'}</p>
                <p><strong>Subject:</strong> {selectedItem.subject}</p>
                <div className="message-content">
                  <strong>Message:</strong>
                  <p>{selectedItem.message}</p>
                </div>
                <p><strong>Submission Date:</strong> {selectedItem.submissionDate ? new Date(selectedItem.submissionDate).toLocaleString() : 'N/A'}</p>
                <p><strong>Status:</strong> {selectedItem.isRead ? 'Read' : 'Unread'}</p>
              </>
            )}
          </div>
        )}
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        show={showEditModal}
        onClose={handleCloseModal}
        title={
          itemType === 'user' ? 'Edit User' :
          itemType === 'car' ? 'Edit Car' :
          itemType === 'booking' ? 'Edit Booking' :
          itemType === 'review' ? 'Edit Review' :
          itemType === 'profile' ? 'Edit Your Profile' :
          itemType === 'contact' ? 'Contact Message' : ''
        }
      >
        {selectedItem && (
          <form onSubmit={handleSubmit}>
            {(itemType === 'user' || itemType === 'profile') && (
              <>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    type="text"
                    name="name"
                    value={editFormData.name || ''}
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
                    value={editFormData.email || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {itemType === 'user' && (
                  <div className="form-group">
                    <label className="form-label">
                      <strong>Role</strong> <span className="text-danger">*</span>
                      <span className="ms-2 text-muted small">(Changes user permissions throughout the system)</span>
                    </label>
                    <select
                      className="form-select role-select"
                      name="role"
                      value={editFormData.role || 'user'}
                      onChange={handleInputChange}
                      style={{
                        borderWidth: '2px',
                        borderColor: editFormData.role === 'admin' ? '#f87171' :
                                    editFormData.role === 'host' ? '#4ade80' :
                                    '#4361ee'
                      }}
                    >
                      <option value="user">User (Standard permissions)</option>
                      <option value="host">Host (Can list and manage cars)</option>
                      <option value="admin">Admin (Full system access)</option>
                    </select>
                    <small className="form-text text-muted">
                      Current role: <span className={`role-badge ${selectedItem?.role}`}>{selectedItem?.role}</span>
                    </small>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-control"
                    type="text"
                    name="phone"
                    value={editFormData.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
                {itemType === 'profile' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Address</label>
                      <input
                        className="form-control"
                        type="text"
                        name="address"
                        value={editFormData.address || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Driver License</label>
                      <input
                        className="form-control"
                        type="text"
                        name="driverLicense"
                        value={editFormData.driverLicense || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    {itemType === 'profile' && (
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
                    )}
                  </>
                )}
              </>
            )}

            {itemType === 'car' && (
              <>
                <div className="car-edit-grid">
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input
                      className="form-control"
                      type="text"
                      name="brand"
                      value={editFormData.brand || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model</label>
                    <input
                      className="form-control"
                      type="text"
                      name="model"
                      value={editFormData.model || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input
                      className="form-control"
                      type="number"
                      name="year"
                      value={editFormData.year || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      name="type"
                      value={editFormData.type || 'Sedan'}
                      onChange={handleInputChange}
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Convertible">Convertible</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Minivan">Minivan</option>
                      <option value="Pickup">Pickup</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fuel Type</label>
                    <select
                      className="form-select"
                      name="fuelType"
                      value={editFormData.fuelType || 'Petrol'}
                      onChange={handleInputChange}
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Transmission</label>
                    <select
                      className="form-select"
                      name="transmission"
                      value={editFormData.transmission || 'Automatic'}
                      onChange={handleInputChange}
                    >
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                      <option value="Semi-Automatic">Semi-Automatic</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Seating Capacity</label>
                    <input
                      className="form-control"
                      type="number"
                      name="seatingCapacity"
                      value={editFormData.seatingCapacity || '5'}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mileage</label>
                    <input
                      className="form-control"
                      type="text"
                      name="mileage"
                      value={editFormData.mileage || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price Per Day</label>
                    <input
                      className="form-control"
                      type="number"
                      name="pricePerDay"
                      value={editFormData.pricePerDay || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Available</label>
                    <select
                      className="form-select"
                      name="isAvailable"
                      value={editFormData.isAvailable ? 'true' : 'false'}
                      onChange={handleInputChange}
                    >
                      <option value="true">Available</option>
                      <option value="false">Not Available</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FontAwesomeIcon icon={faImage} /> Car Images <span className="required-field">*</span>
                  </label>
                  <div className="car-images-container">
                    <CarImageUpload
                      onSuccess={handleCarImageUploadSuccess}
                      existingImages={editFormData.images || []}
                      onRemoveImage={handleRemoveCarImage}
                      carId={selectedItem._id}
                      required={true}
                    />
                    {(!editFormData.images || editFormData.images.length === 0) && (
                      <div className="image-requirement-note">
                        <FontAwesomeIcon icon={faInfoCircle} /> At least one car image is required
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} /> Car Location
                  </label>
                  <GoogleMapSelector
                    initialLocation={
                      editFormData.location?.coordinates?.coordinates ?
                      {
                        lat: editFormData.location.coordinates.coordinates[1],
                        lng: editFormData.location.coordinates.coordinates[0]
                      } :
                      null
                    }
                    onLocationSelect={handleLocationSelect}
                  />
                  {editFormData.location?.address && (
                    <div className="selected-location">
                      <strong>Selected Address:</strong> {editFormData.location.address}
                    </div>
                  )}
                </div>
              </>
            )}

            {itemType === 'booking' && (
              <>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    className="form-control"
                    type="date"
                    name="startDate"
                    value={editFormData.startDate ? new Date(editFormData.startDate).toISOString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    className="form-control"
                    type="date"
                    name="endDate"
                    value={editFormData.endDate ? new Date(editFormData.endDate).toISOString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Booking Status</label>
                  <select
                    className="form-select"
                    name="bookingStatus"
                    value={editFormData.bookingStatus || 'Active'}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select
                    className="form-select"
                    name="paymentStatus"
                    value={editFormData.paymentStatus || 'Pending'}
                    onChange={handleInputChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </>
            )}

            {itemType === 'review' && (
              <>
                <div className="form-group">
                  <label className="form-label">User</label>
                  <input
                    className="form-control"
                    type="text"
                    value={selectedItem.user?.name || 'Unknown User'}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Car</label>
                  <input
                    className="form-control"
                    type="text"
                    value={`${selectedItem.car?.brand || ''} ${selectedItem.car?.model || ''}`}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select
                    className="form-select"
                    name="rating"
                    value={editFormData.rating || 5}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea
                    className="form-control"
                    name="comment"
                    value={editFormData.comment || ''}
                    onChange={handleInputChange}
                    rows="5"
                    required
                  ></textarea>
                </div>
              </>
            )}

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                <span>✕</span> Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <span>✓</span> Save Changes
              </button>
            </div>
          </form>
        )}
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        show={showDeleteModal}
        onClose={handleCloseModal}
        title={`Delete ${itemType ? itemType.charAt(0).toUpperCase() + itemType.slice(1) : 'Item'}`}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={handleCloseModal}
              disabled={isDeleting}
            >
              <span>✕</span> Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              style={{ backgroundColor: 'var(--danger-color)' }}
            >
              <span>{isDeleting ? '⏳' : '🗑️'}</span> {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        {selectedItem && (
          <div>
            <p>Are you sure you want to delete this {itemType}?</p>
            <p>This action cannot be undone.</p>

            {itemType === 'user' && (
              <div className="delete-details">
                <p><strong>Name:</strong> {selectedItem.name}</p>
                <p><strong>Email:</strong> {selectedItem.email}</p>
              </div>
            )}

            {itemType === 'car' && (
              <div className="delete-details">
                <p><strong>Brand:</strong> {selectedItem.brand}</p>
                <p><strong>Model:</strong> {selectedItem.model}</p>
                <p><strong>Year:</strong> {selectedItem.year}</p>
              </div>
            )}

            {itemType === 'booking' && (
              <div className="delete-details">
                <p><strong>User:</strong> {selectedItem.user?.name || 'Unknown User'}</p>
                <p><strong>Car:</strong> {selectedItem.car ? `${selectedItem.car.brand} ${selectedItem.car.model}` : 'Unknown Car'}</p>
                <p><strong>Status:</strong> {selectedItem.bookingStatus}</p>
                <p className="warning-text" style={{ color: 'var(--danger-color)' }}>Warning: This will permanently delete the booking from the database.</p>
              </div>
            )}

            {itemType === 'review' && (
              <div className="delete-details">
                <p><strong>User:</strong> {selectedItem.user?.name || 'Unknown User'}</p>
                <p><strong>Car:</strong> {selectedItem.car ? `${selectedItem.car.brand} ${selectedItem.car.model}` : 'Unknown Car'}</p>
                <p><strong>Rating:</strong> {selectedItem.rating} / 5</p>
              </div>
            )}

            {itemType === 'contact' && (
              <div className="delete-details">
                <p><strong>Name:</strong> {selectedItem.name}</p>
                <p><strong>Email:</strong> {selectedItem.email}</p>
                <p><strong>Subject:</strong> {selectedItem.subject}</p>
              </div>
            )}
          </div>
        )}
      </CustomModal>

      {/* Add Car Modal */}
      <CustomModal
        show={showAddCarModal}
        onClose={handleCloseModal}
        title="Add New Car"
      >
        <form onSubmit={handleAddCarSubmit}>
          <div className="car-edit-grid">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                className="form-control"
                type="text"
                name="brand"
                value={editFormData.brand || ''}
                onChange={handleInputChange}
                required
                placeholder="e.g., Toyota, Honda, BMW"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                className="form-control"
                type="text"
                name="model"
                value={editFormData.model || ''}
                onChange={handleInputChange}
                required
                placeholder="e.g., Camry, Civic, X5"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                className="form-control"
                type="number"
                name="year"
                value={editFormData.year || ''}
                onChange={handleInputChange}
                required
                min="1990"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                name="type"
                value={editFormData.type || 'Sedan'}
                onChange={handleInputChange}
                required
              >
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Convertible">Convertible</option>
                <option value="Sports">Sports</option>
                <option value="Luxury">Luxury</option>
                <option value="Van">Van</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select
                className="form-select"
                name="fuelType"
                value={editFormData.fuelType || 'Petrol'}
                onChange={handleInputChange}
                required
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Transmission</label>
              <select
                className="form-select"
                name="transmission"
                value={editFormData.transmission || 'Automatic'}
                onChange={handleInputChange}
                required
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="Semi-Automatic">Semi-Automatic</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Seating Capacity</label>
              <input
                className="form-control"
                type="number"
                name="seatingCapacity"
                value={editFormData.seatingCapacity || '5'}
                onChange={handleInputChange}
                required
                min="1"
                max="15"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price Per Day ($)</label>
              <input
                className="form-control"
                type="number"
                name="pricePerDay"
                value={editFormData.pricePerDay || '50'}
                onChange={handleInputChange}
                required
                min="1"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mileage (km/l)</label>
              <input
                className="form-control"
                type="number"
                name="mileage"
                value={editFormData.mileage || '0'}
                onChange={handleInputChange}
                min="0"
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Available</label>
              <select
                className="form-select"
                name="isAvailable"
                value={editFormData.isAvailable ? 'true' : 'false'}
                onChange={handleInputChange}
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faTags} /> Car Features
            </label>
            <div className="features-input-container">
              <div className="features-input-wrapper">
                <input
                  type="text"
                  id="feature-input"
                  placeholder="Add a feature (e.g., Bluetooth, GPS, Sunroof)"
                  className="form-control"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const featureText = e.target.value.trim();
                      if (featureText) {
                        setEditFormData({
                          ...editFormData,
                          features: [...(editFormData.features || []), featureText]
                        });
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-primary add-feature-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    const featureInput = document.getElementById('feature-input');
                    const featureText = featureInput.value.trim();
                    if (featureText) {
                      setEditFormData({
                        ...editFormData,
                        features: [...(editFormData.features || []), featureText]
                      });
                      featureInput.value = '';
                    }
                  }}
                >
                  Add
                </button>
              </div>

              {editFormData.features && editFormData.features.length > 0 ? (
                <div className="features-tags">
                  {editFormData.features.map((feature, index) => (
                    <div key={index} className="feature-tag">
                      <span>{feature}</span>
                      <button
                        type="button"
                        className="remove-feature-btn"
                        onClick={() => {
                          const updatedFeatures = [...editFormData.features];
                          updatedFeatures.splice(index, 1);
                          setEditFormData({
                            ...editFormData,
                            features: updatedFeatures
                          });
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-features-message">
                  <FontAwesomeIcon icon={faInfoCircle} /> No features added yet. Add features to make your car listing more attractive.
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faMapMarkerAlt} /> Car Location
            </label>
            <GoogleMapSelector
              initialLocation={
                editFormData.location?.coordinates?.coordinates ?
                {
                  lat: editFormData.location.coordinates.coordinates[1],
                  lng: editFormData.location.coordinates.coordinates[0]
                } :
                null
              }
              onLocationSelect={handleLocationSelect}
            />
            {editFormData.location?.address && (
              <div className="selected-location">
                <strong>Selected Address:</strong> {editFormData.location.address}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <FontAwesomeIcon icon={faImage} /> Car Images <span className="required-field">*</span>
            </label>
            <div className="car-images-container">
              <CarImageUpload
                onSuccess={handleCarImageUploadSuccess}
                existingImages={editFormData.images || []}
                onRemoveImage={handleRemoveCarImage}
                required={true}
              />
              {(!editFormData.images || editFormData.images.length === 0) && (
                <div className="image-requirement-note">
                  <FontAwesomeIcon icon={faInfoCircle} /> At least one car image is required
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
              <span>✕</span> Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <span>✓</span> Add Car
            </button>
          </div>
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
    </div>
  );
};

export default AdminDashboard;
