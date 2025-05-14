import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../assets/Profile.css';
import CustomModal from '../components/CustomModal';
import FileUpload from '../components/FileUpload';
import DocumentList from '../components/DocumentList';

const Profile = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    driverLicense: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Check user ID and fetch latest user data on component mount
  useEffect(() => {
    const checkUserID = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = storedUser._id || currentUser?._id;

        console.log('Checking user ID on mount:', userId);

        if (userId) {
          const exists = await checkUserExists(userId);
          console.log('User exists in database:', exists);

          if (!exists) {
            console.error('User not found in database. This will cause password change to fail.');
          } else {
            // Fetch the latest user data from the API
            try {
              const token = localStorage.getItem('token');
              if (token) {
                const response = await api.get('/auth/me', {
                  headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Fetched latest user data:', response.data);

                // Update localStorage with the latest user data
                if (response.data) {
                  const updatedUser = {
                    ...storedUser,
                    ...response.data,
                    token // Keep the token
                  };

                  localStorage.setItem('user', JSON.stringify(updatedUser));
                  console.log('Updated user data in localStorage with latest from server');
                }
              }
            } catch (fetchError) {
              console.error('Error fetching latest user data:', fetchError);
            }
          }
        } else {
          console.error('No user ID found. This will cause password change to fail.');
        }
      } catch (error) {
        console.error('Error checking user ID:', error);
      }
    };

    checkUserID();
  }, [currentUser?._id]);

  useEffect(() => {
    // Populate form with current user data
    if (currentUser) {
      // Fix for the "John Doe" issue
      let userName = currentUser.name;
      if (userName === 'John Doe') {
        console.log('Fixing hardcoded "John Doe" name in Profile component');
        userName = 'User';

        // Update localStorage to fix the issue permanently
        try {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser && storedUser.name === 'John Doe') {
            storedUser.name = 'User';
            localStorage.setItem('user', JSON.stringify(storedUser));
          }
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }

      setFormData({
        name: userName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        driverLicense: currentUser.driverLicense || ''
      });

      // Fetch user documents
      fetchUserDocuments();
    }
  }, [currentUser]);

  // Fetch user documents
  const fetchUserDocuments = async () => {
    setLoadingDocuments(true);
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.get('/users/documents', { headers });
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Make API call to update profile
      const response = await api.put('/users/profile', formData, { headers });
      console.log('Profile update response:', response.data);

      // Update the current user data using the refreshUserData function
      if (response.data) {
        try {
          // Refresh user data from the server to ensure we have the latest data
          await refreshUserData();
          console.log('User data refreshed after profile update');
        } catch (refreshError) {
          console.error('Error refreshing user data after profile update:', refreshError);

          // Fallback to manual update if refreshUserData fails
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = {
            ...storedUser,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            driverLicense: formData.driverLicense
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        // Show success message
        setMessage('Profile updated successfully!');
        setIsEditing(false);

        // Reload the page after a short delay to refresh user data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setError('');
    setMessage('');
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

  // We don't need this function anymore as we'll use the main API
  // Keeping it as a no-op for now to avoid breaking existing code
  const checkUserExists = async (userId) => {
    console.log('User existence check bypassed, using main API instead');
    return true;
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

      console.log('User information:', {
        storedUser,
        currentUser,
        userId
      });

      if (!userId) {
        setPasswordError('User ID not found. Please log in again.');
        setIsChangingPassword(false);
        return;
      }

      // Prepare data for the API call
      const passwordData = {
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword,
        confirmPassword: passwordFormData.confirmPassword
      };

      console.log('Sending password change request with data:', passwordData);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setPasswordError('Authentication token not found. Please log in again.');
        setIsChangingPassword(false);
        return;
      }

      // Make API call to the main backend API
      const response = await api.put('/users/change-password', passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Password change response:', response.data);

      // Show success message
      setPasswordSuccess(response.data.message || 'Password changed successfully!');

      // Clear form
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Refresh user data to ensure we have the latest data
      try {
        await refreshUserData();
        console.log('User data refreshed after password change');
      } catch (refreshError) {
        console.error('Error refreshing user data after password change:', refreshError);
      }

      // Close modal after a delay
      setTimeout(() => {
        closePasswordModal();
      }, 2000);
    } catch (err) {
      console.error('Error changing password:', err);

      // Handle API error responses
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = err.response.data?.message || 'Failed to change password';
        setPasswordError(errorMessage);

        console.log('Error details:', {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        });
      } else if (err.request) {
        // The request was made but no response was received
        console.log('No response received:', err.request);
        setPasswordError('No response from server. Please try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error setting up request:', err.message);
        setPasswordError('Error setting up request: ' + err.message);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information</p>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-image">
            {currentUser?.profileImage ? (
              <img
                src={currentUser.profileImage}
                alt={currentUser.name}
                onClick={(e) => e.stopPropagation()}
                onError={(e) => {
                  console.error("Error loading profile image:", currentUser.profileImage);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150';
                }}
                style={{ pointerEvents: 'none' }}
              />
            ) : (
              <div className="profile-initial">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <h3>{currentUser?.name || 'User'}</h3>
          <p>{currentUser?.email || 'user@example.com'}</p>
          <p className="user-role">
            {currentUser?.role === 'host' ? 'Host' : ''}
          </p>
        </div>

        <div className="profile-details">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={true} // Email cannot be changed
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="driverLicense">Driver License Number</label>
              <input
                type="text"
                id="driverLicense"
                name="driverLicense"
                value={formData.driverLicense}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-control"
                required
              />
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={toggleEdit}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={toggleEdit}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </form>

          <div className="password-section">
            <h3>Password Management</h3>
            <p>For security reasons, you can change your password here.</p>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={openPasswordModal}
            >
              Change Password
            </button>
          </div>

          {/* Profile Image Upload Section */}
          <div className="profile-image-upload-section">
            <h3>Profile Picture</h3>
            <p>Upload a new profile picture</p>
            <FileUpload
              endpoint="/users/profile-image"
              fileType="profileImage"
              maxSize={5}
              allowedTypes={['jpg', 'jpeg', 'png', 'gif', 'webp']}
              buttonText="Upload Profile Picture"
              onSuccess={async (data) => {
                // Update profile image in UI
                if (data && data.profileImage) {
                  console.log('Profile image upload successful:', data.profileImage);

                  try {
                    // Use the refreshUserData function to get the latest user data
                    await refreshUserData();
                    console.log('User data refreshed after profile image update');

                    // Ensure the profile image is updated in localStorage
                    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                    if (storedUser && storedUser.profileImage !== data.profileImage) {
                      storedUser.profileImage = data.profileImage;
                      localStorage.setItem('user', JSON.stringify(storedUser));
                      console.log('Ensured profile image is updated in localStorage:', data.profileImage);
                    }
                  } catch (error) {
                    console.error('Error refreshing user data after profile image upload:', error);

                    // Fallback: manually update the profile image in localStorage
                    try {
                      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
                      storedUser.profileImage = data.profileImage;
                      localStorage.setItem('user', JSON.stringify(storedUser));
                      console.log('Manually updated profile image in localStorage:', data.profileImage);
                    } catch (localStorageError) {
                      console.error('Error updating localStorage:', localStorageError);
                    }
                  }

                  // Show success message
                  setMessage('Profile picture updated successfully!');

                  // Reload the page after a short delay to refresh user data
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                }
              }}
            />
          </div>

          {/* Document Upload Section */}
          <div className="document-upload-section">
            <h3>Documents</h3>
            <p>Upload important documents like resumes, certificates, etc.</p>
            <FileUpload
              endpoint="/users/documents"
              fileType="document"
              maxSize={10}
              allowedTypes={['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx']}
              buttonText="Upload Document"
              onSuccess={() => {
                // Refresh documents list
                fetchUserDocuments();
                setMessage('Document uploaded successfully!');
              }}
            />

            {/* Document List */}
            {loadingDocuments ? (
              <p>Loading documents...</p>
            ) : (
              <DocumentList
                documents={documents}
                onRefresh={fetchUserDocuments}
              />
            )}
          </div>
        </div>
      </div>

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

export default Profile;
