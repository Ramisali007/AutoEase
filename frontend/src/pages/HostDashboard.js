import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import api from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar,
  faCalendarCheck,
  faEdit,
  faEye,
  faPlus,
  faTrash,
  faMoneyBill,
  faChartLine,
  faUserCog,
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faImage,
  faTags,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import CustomModal from '../components/CustomModal';
import CarImageUpload from '../components/CarImageUpload';
import HostChatSection from '../components/HostChatSection';
import '../assets/HostDashboard.css';

const HostDashboard = () => {
  const { currentUser } = useAuth();
  const { admins } = useChat();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeSection, setActiveSection] = useState('cars');
  const [showChatSection, setShowChatSection] = useState(false);

  // Data states
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState({
    total: 0,
    monthly: 0,
    pending: 0
  });

  // Search states
  const [carSearchTerm, setCarSearchTerm] = useState('');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState('');
  const [editFormData, setEditFormData] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // Check if user is a host
    if (currentUser && currentUser.role !== 'host' && currentUser.role !== 'admin') {
      // Redirect non-host users to home page
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch host's cars
        const carsResponse = await api.get('/host/cars', { headers });
        setCars(carsResponse.data || []);

        // Fetch bookings for host's cars
        const bookingsResponse = await api.get('/host/bookings', { headers });
        setBookings(bookingsResponse.data || []);

        // Fetch earnings data
        const earningsResponse = await api.get('/host/earnings', { headers });
        setEarnings(earningsResponse.data || {
          total: 0,
          monthly: 0,
          pending: 0
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
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
      images: [],
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
        case 'car':
          response = await api.delete(`/host/cars/${selectedItem._id}`, { headers });
          if (response.data) {
            setCars(cars.filter(car => car._id !== selectedItem._id));
            showSavedNotification('Car deleted successfully');
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

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for isAvailable field to convert string to boolean
    if (name === 'isAvailable') {
      setEditFormData({
        ...editFormData,
        [name]: value === 'true'
      });
    }
    // Special handling for numeric fields
    else if (['year', 'seatingCapacity', 'pricePerDay', 'mileage'].includes(name)) {
      setEditFormData({
        ...editFormData,
        [name]: value === '' ? '' : Number(value)
      });
    }
    // Default handling for other fields
    else {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }
  };

  // Navigate to the dedicated Profile page instead of opening a modal
  const handleEditProfile = () => {
    navigate('/profile');
  };

  // Search filter functions
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
        (booking.bookingStatus && booking.bookingStatus.toLowerCase().includes(searchLower))
      );
    });
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

    // Validate required fields based on item type
    if (itemType === 'car') {
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
    }

    try {
      // Show loading state
      setLoading(true);

      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let response;

      if (itemType === 'car') {
        console.log(`Updating car with ID: ${selectedItem._id}`);
        console.log("Car update data:", editFormData);

        try {
          // Ensure location coordinates are properly formatted
          const carData = {
            ...editFormData,
            location: editFormData.location || {
              address: '',
              coordinates: {
                type: 'Point',
                coordinates: [0, 0]
              }
            }
          };

          // Use the host cars endpoint to update the car
          response = await api.put(`/host/cars/${selectedItem._id}`, carData, { headers });
          console.log("Car update response:", response);

          // Update cars state with the edited car
          setCars(cars.map(car =>
            car._id === selectedItem._id ? response.data : car
          ));
        } catch (error) {
          console.error("Car update error:", error);
          throw error;
        }
      }

      // Close the modal
      handleCloseModal();

      // Clear any previous error messages
      setError('');

      // Show success message
      setSuccessMessage(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} updated successfully! Changes have been saved to the database.`);

      // Show notification
      setNotificationMessage(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} updated successfully!`);
      setShowNotification(true);

      // Clear notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

      console.log('Item updated successfully:', response.data);
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle car image upload success
  const handleCarImageUploadSuccess = (imageUrls) => {
    setEditFormData({
      ...editFormData,
      images: [...(editFormData.images || []), ...imageUrls]
    });

    // Show success notification
    setNotificationMessage('Images uploaded successfully!');
    setShowNotification(true);

    // Clear notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Handle remove car image
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

      const response = await api.post('/host/cars', carData, { headers });
      console.log("Add car response:", response);

      // Add the new car to the cars state
      setCars([...cars, response.data.car]);

      // Close the modal
      handleCloseModal();

      // Clear any previous error messages
      setError('');

      // Show success message
      setSuccessMessage('Car added successfully! Your car has been saved to the database.');

      // Show notification
      setNotificationMessage('Car added successfully! Your car is now available for rent.');
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

  if (loading) {
    return <div className="loading">Loading host dashboard...</div>;
  }

  return (
    <div className="host-dashboard-container">
      <div className="host-header">
        <div className="host-header-content">
          <div>
            <h1>Host Dashboard</h1>
            <p>Welcome, {currentUser?.name || 'Host'}! Manage your cars, bookings, and track your earnings.</p>
          </div>
          <div className="host-profile">
            <div className="host-profile-info">
              <h3>{currentUser?.name || 'Host'}</h3>
              <p>{currentUser?.email || 'host@example.com'}</p>
            </div>
            <button className="btn-edit profile-edit-btn" onClick={handleEditProfile}>
              <FontAwesomeIcon icon={faUserCog} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="success-alert">
          <FontAwesomeIcon icon={faCheckCircle} /> {successMessage}
        </div>
      )}

      {error && (
        <div className="error-alert">
          <FontAwesomeIcon icon={faExclamationCircle} /> {error}
        </div>
      )}

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

      <div className="host-stats">
        <div
          className={`stat-card ${activeSection === 'cars' ? 'active' : ''}`}
          onClick={() => setActiveSection('cars')}
        >
          <h3><FontAwesomeIcon icon={faCar} /> My Cars</h3>
          <p className="stat-number">{cars.length}</p>
          <p className="stat-detail">
            <span className="highlight">{cars.filter(car => car.isAvailable).length}</span> available for rent
          </p>
        </div>
        <div
          className={`stat-card ${activeSection === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveSection('bookings')}
        >
          <h3><FontAwesomeIcon icon={faCalendarCheck} /> Bookings</h3>
          <p className="stat-number">{bookings.length}</p>
          <p className="stat-detail">
            <span className="highlight">
              {bookings.filter(booking => booking.bookingStatus === 'Confirmed').length}
            </span> active bookings
          </p>
        </div>
        <div
          className={`stat-card ${activeSection === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveSection('earnings')}
        >
          <h3><FontAwesomeIcon icon={faChartLine} /> Earnings</h3>
          <p className="stat-number">${earnings.total.toFixed(2)}</p>
          <p className="stat-detail">
            <span className="highlight">${earnings.monthly.toFixed(2)}</span> this month
          </p>
        </div>
        <div
          className={`stat-card ${activeSection === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveSection('chat')}
          style={{
            borderTop: '4px solid #4361ee',
            transition: 'all 0.3s ease'
          }}
        >
          <h3><FontAwesomeIcon icon={faComments} style={{ color: '#4361ee' }} /> Chat</h3>
          <p className="stat-number" style={{ color: '#4361ee' }}>{admins.length || 0}</p>
          <p className="stat-detail">
            <span className="highlight">Support</span> chat with admins
          </p>
        </div>
      </div>

      {/* Cars Section */}
      <div className={`host-section ${activeSection === 'cars' ? 'active' : ''}`}>
        <div className="section-header">
          <h2><FontAwesomeIcon icon={faCar} /> My Cars</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by brand, model, or year..."
              value={carSearchTerm}
              onChange={(e) => setCarSearchTerm(e.target.value)}
              className="search-input"
            />
            <button className="btn-add" onClick={handleAddCar}>
              <FontAwesomeIcon icon={faPlus} /> Add New Car
            </button>
          </div>
        </div>

        <div className="section-content">
          {getFilteredCars().length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FontAwesomeIcon icon={faCar} />
              </div>
              <h3>No Cars Yet</h3>
              <p>You haven't added any cars to your profile. Add your first car to start hosting!</p>
              <button className="btn-add-empty" onClick={handleAddCar}>
                <FontAwesomeIcon icon={faPlus} /> Add Your First Car
              </button>
            </div>
          )}

          {getFilteredCars().length > 0 && (
            <div className="table-container">
              <table className="data-table">
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
                  {getFilteredCars().map(car => (
                    <tr key={car._id || `car-${Math.random()}`}>
                      <td><strong>{car.brand || 'N/A'}</strong></td>
                      <td>{car.model || 'N/A'}</td>
                      <td>{car.year || 'N/A'}</td>
                      <td><span className="price-tag">${car.pricePerDay?.toFixed(2) || '0.00'}</span></td>
                      <td>
                        <span className={`status-badge ${car.isAvailable ? 'available' : 'unavailable'}`}>
                          {car.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => handleView(car, 'car')}
                          title="View car details"
                        >
                          <FontAwesomeIcon icon={faEye} /> View
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(car, 'car')}
                          title="Edit car details"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(car, 'car')}
                          title="Delete this car"
                        >
                          <FontAwesomeIcon icon={faTrash} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bookings Section */}
      <div className={`host-section ${activeSection === 'bookings' ? 'active' : ''}`}>
        <div className="section-header">
          <h2><FontAwesomeIcon icon={faCalendarCheck} /> Bookings</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by user, car, or status..."
              value={bookingSearchTerm}
              onChange={(e) => setBookingSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="section-content">
          {getFilteredBookings().length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>
              <h3>No Bookings Yet</h3>
              <p>You don't have any bookings for your cars yet. Once users book your cars, they'll appear here.</p>
            </div>
          )}

          {getFilteredBookings().length > 0 && (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Car</th>
                    <th>Dates</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredBookings().map(booking => (
                    <tr key={booking._id || `booking-${Math.random()}`}>
                      <td><strong>{booking.user?.name || 'Unknown User'}</strong></td>
                      <td>{booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Unknown Car'}</td>
                      <td>
                        <span className="date-range">
                          <span className="date-start">{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</span>
                          <span className="date-separator">to</span>
                          <span className="date-end">{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</span>
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${booking.bookingStatus?.toLowerCase()}`}>
                          {booking.bookingStatus || 'Pending'}
                        </span>
                      </td>
                      <td><span className="price-tag">${booking.totalAmount?.toFixed(2) || '0.00'}</span></td>
                      <td>
                        <button
                          className="btn-view"
                          onClick={() => handleView(booking, 'booking')}
                          title="View booking details"
                        >
                          <FontAwesomeIcon icon={faEye} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className={`host-section ${activeSection === 'chat' ? 'active' : ''}`}>
        <div className="section-header">
          <h2><FontAwesomeIcon icon={faComments} /> Chat with Administrators</h2>
        </div>

        <div className="section-content">
          <HostChatSection />
        </div>
      </div>

      {/* Earnings Section */}
      <div className={`host-section ${activeSection === 'earnings' ? 'active' : ''}`}>
        <div className="section-header">
          <h2><FontAwesomeIcon icon={faChartLine} /> Earnings</h2>
        </div>

        <div className="section-content">
          <div className="earnings-container">
            <div className="earnings-card total">
              <div className="earnings-icon">
                <FontAwesomeIcon icon={faMoneyBill} />
              </div>
              <div className="earnings-info">
                <h3>Total Earnings</h3>
                <p className="earnings-amount">${earnings.total.toFixed(2)}</p>
                <p className="earnings-description">Lifetime earnings from all bookings</p>
              </div>
            </div>

            <div className="earnings-card monthly">
              <div className="earnings-icon">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>
              <div className="earnings-info">
                <h3>Monthly Earnings</h3>
                <p className="earnings-amount">${earnings.monthly.toFixed(2)}</p>
                <p className="earnings-description">Earnings for the current month</p>
              </div>
            </div>

            <div className="earnings-card pending">
              <div className="earnings-icon">
                <FontAwesomeIcon icon={faInfoCircle} />
              </div>
              <div className="earnings-info">
                <h3>Pending Earnings</h3>
                <p className="earnings-amount">${earnings.pending.toFixed(2)}</p>
                <p className="earnings-description">Expected earnings from active bookings</p>
              </div>
            </div>
          </div>

          <div className="earnings-tips">
            <h3><FontAwesomeIcon icon={faInfoCircle} /> Tips to Increase Your Earnings</h3>
            <ul>
              <li>Keep your car availability calendar up to date</li>
              <li>Respond quickly to booking requests</li>
              <li>Add high-quality photos of your vehicles</li>
              <li>Provide excellent customer service to get positive reviews</li>
              <li>Consider offering special rates for longer bookings</li>
            </ul>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <CustomModal
        show={showViewModal}
        onClose={handleCloseModal}
        title={`View ${itemType ? itemType.charAt(0).toUpperCase() + itemType.slice(1) : 'Item'}`}
        footer={
          <button className="btn btn-secondary" onClick={handleCloseModal}>
            Close
          </button>
        }
      >
        {selectedItem && (
          <div className="view-details">
            {itemType === 'car' && (
              <>
                <div className="detail-group">
                  <label>Brand:</label>
                  <p>{selectedItem.brand || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Model:</label>
                  <p>{selectedItem.model || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Year:</label>
                  <p>{selectedItem.year || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Type:</label>
                  <p>{selectedItem.type || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Fuel Type:</label>
                  <p>{selectedItem.fuelType || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Transmission:</label>
                  <p>{selectedItem.transmission || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Seating Capacity:</label>
                  <p>{selectedItem.seatingCapacity || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Price Per Day:</label>
                  <p>${selectedItem.pricePerDay?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="detail-group">
                  <label>Mileage:</label>
                  <p>{selectedItem.mileage || 'N/A'} km/l</p>
                </div>
                <div className="detail-group">
                  <label>Status:</label>
                  <p>{selectedItem.isAvailable ? 'Available' : 'Unavailable'}</p>
                </div>
                {selectedItem.images && selectedItem.images.length > 0 && (
                  <div className="detail-group">
                    <label>Images:</label>
                    <div className="car-images">
                      {selectedItem.images.map((image, index) => (
                        <img
                          key={index}
                          src={image.startsWith('http') ? image : `/uploads/cars/${image}`}
                          alt={`${selectedItem.brand} ${selectedItem.model}`}
                          className="car-image-thumbnail"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {itemType === 'booking' && (
              <>
                <div className="detail-group">
                  <label>User:</label>
                  <p>{selectedItem.user?.name || 'Unknown User'}</p>
                </div>
                <div className="detail-group">
                  <label>Email:</label>
                  <p>{selectedItem.user?.email || 'No Email'}</p>
                </div>
                <div className="detail-group">
                  <label>Phone:</label>
                  <p>{selectedItem.user?.phone || 'No Phone'}</p>
                </div>
                <div className="detail-group">
                  <label>Car:</label>
                  <p>{selectedItem.car ? `${selectedItem.car.brand} ${selectedItem.car.model} (${selectedItem.car.year})` : 'Unknown Car'}</p>
                </div>
                <div className="detail-group">
                  <label>Start Date:</label>
                  <p>{selectedItem.startDate ? new Date(selectedItem.startDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>End Date:</label>
                  <p>{selectedItem.endDate ? new Date(selectedItem.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <label>Booking Status:</label>
                  <p>{selectedItem.bookingStatus || 'Pending'}</p>
                </div>
                <div className="detail-group">
                  <label>Payment Status:</label>
                  <p>{selectedItem.paymentStatus || 'Pending'}</p>
                </div>
                <div className="detail-group">
                  <label>Total Amount:</label>
                  <p>${selectedItem.totalAmount?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="detail-group">
                  <label>Booking Date:</label>
                  <p>{selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
              </>
            )}
          </div>
        )}
      </CustomModal>

      {/* Edit Modal */}
      <CustomModal
        show={showEditModal}
        onClose={handleCloseModal}
        title={`Edit ${itemType ? itemType.charAt(0).toUpperCase() + itemType.slice(1) : 'Item'}`}
      >
        {selectedItem && (
          <form onSubmit={handleSubmit}>
            {itemType === 'car' && (
              <>
                <div className="form-group">
                  <label htmlFor="brand">Brand:</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={editFormData.brand || ''}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    placeholder="e.g., Toyota, Honda, BMW"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="model">Model:</label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={editFormData.model || ''}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    placeholder="e.g., Camry, Civic, X5"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="year">Year:</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={editFormData.year || ''}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">Type:</label>
                  <select
                    id="type"
                    name="type"
                    value={editFormData.type || ''}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Type</option>
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
                  <label htmlFor="fuelType">Fuel Type:</label>
                  <select
                    id="fuelType"
                    name="fuelType"
                    value={editFormData.fuelType || ''}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="transmission">Transmission:</label>
                  <select
                    id="transmission"
                    name="transmission"
                    value={editFormData.transmission || ''}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  >
                    <option value="">Select Transmission</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="seatingCapacity">Seating Capacity:</label>
                  <input
                    type="number"
                    id="seatingCapacity"
                    name="seatingCapacity"
                    value={editFormData.seatingCapacity || ''}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    min="1"
                    max="15"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pricePerDay">Price Per Day ($):</label>
                  <input
                    type="number"
                    id="pricePerDay"
                    name="pricePerDay"
                    value={editFormData.pricePerDay || ''}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="mileage">Mileage (km/l):</label>
                  <input
                    type="number"
                    id="mileage"
                    name="mileage"
                    value={editFormData.mileage || ''}
                    onChange={handleInputChange}
                    className="form-control"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={editFormData.description || ''}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="3"
                    placeholder="Describe your car's features, condition, etc."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="features">
                    <FontAwesomeIcon icon={faTags} /> Car Features:
                  </label>
                  <div className="features-input-container">
                    <div className="features-input-wrapper">
                      <input
                        type="text"
                        id="edit-feature-input"
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
                          const featureInput = document.getElementById('edit-feature-input');
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
                  <label htmlFor="car-images">
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
                  <label htmlFor="isAvailable">Availability:</label>
                  <select
                    id="isAvailable"
                    name="isAvailable"
                    value={editFormData.isAvailable ? 'true' : 'false'}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
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

      {/* Add Car Modal */}
      <CustomModal
        show={showAddCarModal}
        onClose={handleCloseModal}
        title="Add New Car"
      >
        <form onSubmit={handleAddCarSubmit}>
          <div className="form-group">
            <label htmlFor="brand">Brand:</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={editFormData.brand || ''}
              onChange={handleInputChange}
              className="form-control"
              required
              placeholder="e.g., Toyota, Honda, BMW"
            />
          </div>
          <div className="form-group">
            <label htmlFor="model">Model:</label>
            <input
              type="text"
              id="model"
              name="model"
              value={editFormData.model || ''}
              onChange={handleInputChange}
              className="form-control"
              required
              placeholder="e.g., Camry, Civic, X5"
            />
          </div>
          <div className="form-group">
            <label htmlFor="year">Year:</label>
            <input
              type="number"
              id="year"
              name="year"
              value={editFormData.year || ''}
              onChange={handleInputChange}
              className="form-control"
              required
              min="1990"
              max={new Date().getFullYear() + 1}
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Type:</label>
            <select
              id="type"
              name="type"
              value={editFormData.type || ''}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Select Type</option>
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
            <label htmlFor="fuelType">Fuel Type:</label>
            <select
              id="fuelType"
              name="fuelType"
              value={editFormData.fuelType || ''}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Select Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="transmission">Transmission:</label>
            <select
              id="transmission"
              name="transmission"
              value={editFormData.transmission || ''}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Select Transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="seatingCapacity">Seating Capacity:</label>
            <input
              type="number"
              id="seatingCapacity"
              name="seatingCapacity"
              value={editFormData.seatingCapacity || ''}
              onChange={handleInputChange}
              className="form-control"
              required
              min="1"
              max="15"
            />
          </div>
          <div className="form-group">
            <label htmlFor="pricePerDay">Price Per Day ($):</label>
            <input
              type="number"
              id="pricePerDay"
              name="pricePerDay"
              value={editFormData.pricePerDay || ''}
              onChange={handleInputChange}
              className="form-control"
              required
              min="1"
              step="0.01"
            />
          </div>
          <div className="form-group">
            <label htmlFor="mileage">Mileage (km/l):</label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={editFormData.mileage || ''}
              onChange={handleInputChange}
              className="form-control"
              min="0"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={editFormData.description || ''}
              onChange={handleInputChange}
              className="form-control"
              rows="3"
              placeholder="Describe your car's features, condition, etc."
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="features">
              <FontAwesomeIcon icon={faTags} /> Car Features:
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
            <label htmlFor="car-images">
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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!editFormData.images || editFormData.images.length === 0}
            >
              <span>✓</span> Add Car
            </button>
          </div>
        </form>
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

            {itemType === 'car' && (
              <div className="delete-details">
                <p><strong>Brand:</strong> {selectedItem.brand}</p>
                <p><strong>Model:</strong> {selectedItem.model}</p>
                <p><strong>Year:</strong> {selectedItem.year}</p>
                <p className="warning-text" style={{ color: 'var(--danger-color)' }}>
                  Warning: This will also delete all bookings and reviews associated with this car.
                </p>
              </div>
            )}
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default HostDashboard;
