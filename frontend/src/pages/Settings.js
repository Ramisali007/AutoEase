import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  FaCog,
  FaUserCircle,
  FaBell,
  FaLock,
  FaCreditCard,
  FaCarAlt,
  FaSignOutAlt,
  FaCheck,
  FaToggleOn,
  FaToggleOff,
  FaExclamationTriangle,
  FaShieldAlt,
  FaGlobe,
  FaEnvelope,
  FaMoneyBillWave,
  FaSave,
  FaUserEdit,
  FaKey,
  FaCreditCard as FaCreditCardAlt,
  FaLanguage
} from 'react-icons/fa';
import '../assets/Settings.css';

const Settings = () => {
  const { currentUser } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    language: 'english',
    darkMode: false,
    emailNotifications: true,
    smsNotifications: false,
    appNotifications: true,
    twoFactorAuth: false,
    autoRenew: true,
    savePaymentInfo: true,
    defaultCurrency: 'USD'
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load user data and settings
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          console.log('Loading user data for:', currentUser.email);

          // Set basic user data
          const userData = {
            ...formData,
            firstName: currentUser.name ? currentUser.name.split(' ')[0] : '',
            lastName: currentUser.name ? currentUser.name.split(' ')[1] || '' : '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
            // Set darkMode from ThemeContext
            darkMode: darkMode
          };

          console.log('Basic user data:', userData);

          // Try to get user settings from API
          try {
            console.log('Fetching settings from API...');
            const response = await api.get('/users/settings');
            console.log('API settings response:', response.data);

            // If we have settings from the API, merge them with our form data
            if (response.data) {
              // Handle each setting individually
              if (response.data.language !== undefined) {
                userData.language = response.data.language;
              }

              if (response.data.darkMode !== undefined) {
                userData.darkMode = response.data.darkMode;
              }

              if (response.data.emailNotifications !== undefined) {
                userData.emailNotifications = response.data.emailNotifications;
              }

              if (response.data.smsNotifications !== undefined) {
                userData.smsNotifications = response.data.smsNotifications;
              }

              if (response.data.appNotifications !== undefined) {
                userData.appNotifications = response.data.appNotifications;
              }

              if (response.data.twoFactorAuth !== undefined) {
                userData.twoFactorAuth = response.data.twoFactorAuth;
              }

              if (response.data.autoRenew !== undefined) {
                userData.autoRenew = response.data.autoRenew;
              }

              if (response.data.savePaymentInfo !== undefined) {
                userData.savePaymentInfo = response.data.savePaymentInfo;
              }

              if (response.data.defaultCurrency !== undefined) {
                userData.defaultCurrency = response.data.defaultCurrency;
              }
            }
          } catch (error) {
            console.error('Failed to load settings from API:', error);
            if (error.response) {
              console.error('Error response:', error.response.data);
            }
            // Continue with default values if API call fails
          }

          console.log('Final user data with settings:', userData);
          setFormData(userData);
          setLoading(false);
        } catch (error) {
          console.error('Error loading user data:', error);
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [currentUser, darkMode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Clear any messages when changing tabs
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      console.log('Saving settings:', formData);

      // Get the authentication token
      const token = localStorage.getItem('token');
      console.log('Token for settings request:', token ? 'Present' : 'Missing');

      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }

      // Determine which tab is active to know what to save
      if (activeTab === 'profile') {
        // Handle profile update
        const profileData = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone
        };

        console.log('Updating profile with:', profileData);

        // Update profile using the profile endpoint
        const profileResponse = await api.put('/users/profile', profileData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Profile update response:', profileResponse.data);

        // Update user in localStorage
        const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUserData = {
          ...currentUserData,
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        };
        localStorage.setItem('user', JSON.stringify(updatedUserData));

        setSuccessMessage('Profile updated successfully!');
      } else {
        // Handle settings update
        // Extract only the settings fields from formData based on active tab
        let settingsToSave = {};

        if (activeTab === 'general') {
          settingsToSave = {
            language: formData.language,
            darkMode: formData.darkMode,
            defaultCurrency: formData.defaultCurrency
          };
        } else if (activeTab === 'notifications') {
          settingsToSave = {
            emailNotifications: formData.emailNotifications,
            smsNotifications: formData.smsNotifications,
            appNotifications: formData.appNotifications
          };
        } else if (activeTab === 'security') {
          settingsToSave = {
            twoFactorAuth: formData.twoFactorAuth
          };
        } else if (activeTab === 'payment') {
          settingsToSave = {
            autoRenew: formData.autoRenew,
            savePaymentInfo: formData.savePaymentInfo
          };
        }

        console.log('Sending settings to API:', settingsToSave);

        // Save settings to the database
        const response = await api.put('/users/settings', { settings: settingsToSave }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Settings update response:', response.data);

        // If darkMode was changed, update the theme
        if (settingsToSave.darkMode !== undefined && settingsToSave.darkMode !== darkMode) {
          toggleTheme();
        }

        setSuccessMessage('Settings saved successfully!');
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setErrorMessage(`Failed to save: ${error.response.data.message || 'Please try again.'}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        setErrorMessage('Failed to save: No response from server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        setErrorMessage(`Failed to save: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title"><FaGlobe size={22} /> General Settings</h2>
              <p className="settings-section-description">Manage your basic account settings and preferences.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="settings-form-group">
                <label className="settings-form-label">Language</label>
                <select
                  name="language"
                  className="settings-form-control"
                  value={formData.language}
                  onChange={handleInputChange}
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                  <option value="german">German</option>
                  <option value="chinese">Chinese</option>
                  <option value="japanese">Japanese</option>
                </select>
              </div>

              <div className="settings-toggle">
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    name="darkMode"
                    checked={formData.darkMode}
                    onChange={(e) => {
                      handleInputChange(e);
                      // We don't call toggleTheme() here because we want to wait until the form is submitted
                    }}
                  />
                  <span className="settings-toggle-slider"></span>
                </label>
                <span className="settings-toggle-label">
                  Dark Mode {formData.darkMode ? <FaToggleOn /> : <FaToggleOff />}
                </span>
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">Default Currency</label>
                <select
                  name="defaultCurrency"
                  className="settings-form-control"
                  value={formData.defaultCurrency}
                  onChange={handleInputChange}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>

              <div className="settings-btn-group">
                <button
                  type="submit"
                  className="settings-btn settings-btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        );

      case 'profile':
        return (
          <div className="settings-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title"><FaUserCircle size={22} /> Profile Information</h2>
              <p className="settings-section-description">Update your personal information and contact details.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="settings-form-group">
                <label className="settings-form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="settings-form-control"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                />
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="settings-form-control"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                />
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="settings-form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="settings-form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="settings-btn-group">
                <button
                  type="submit"
                  className="settings-btn settings-btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : <><FaUserEdit /> Update Profile</>}
                </button>
              </div>
            </form>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title"><FaBell size={22} /> Notification Preferences</h2>
              <p className="settings-section-description">Control how and when you receive notifications.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="settings-toggle">
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={formData.emailNotifications}
                    onChange={handleInputChange}
                  />
                  <span className="settings-toggle-slider"></span>
                </label>
                <span className="settings-toggle-label">
                  Email Notifications {formData.emailNotifications ? <FaToggleOn /> : <FaToggleOff />}
                </span>
              </div>

              <div className="settings-toggle">
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    name="smsNotifications"
                    checked={formData.smsNotifications}
                    onChange={handleInputChange}
                  />
                  <span className="settings-toggle-slider"></span>
                </label>
                <span className="settings-toggle-label">
                  SMS Notifications {formData.smsNotifications ? <FaToggleOn /> : <FaToggleOff />}
                </span>
              </div>

              <div className="settings-toggle">
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    name="appNotifications"
                    checked={formData.appNotifications}
                    onChange={handleInputChange}
                  />
                  <span className="settings-toggle-slider"></span>
                </label>
                <span className="settings-toggle-label">
                  App Notifications {formData.appNotifications ? <FaToggleOn /> : <FaToggleOff />}
                </span>
              </div>

              <div className="settings-btn-group">
                <button
                  type="submit"
                  className="settings-btn settings-btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : <><FaBell /> Save Preferences</>}
                </button>
              </div>
            </form>
          </div>
        );

      case 'security':
        return (
          <div className="settings-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title"><FaShieldAlt size={22} /> Security Settings</h2>
              <p className="settings-section-description">Manage your account security and authentication options.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="settings-toggle">
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    name="twoFactorAuth"
                    checked={formData.twoFactorAuth}
                    onChange={handleInputChange}
                  />
                  <span className="settings-toggle-slider"></span>
                </label>
                <span className="settings-toggle-label">
                  Two-Factor Authentication {formData.twoFactorAuth ? <FaToggleOn /> : <FaToggleOff />}
                </span>
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">Change Password</label>
                <input
                  type="password"
                  className="settings-form-control"
                  placeholder="Current password"
                />
              </div>

              <div className="settings-form-group">
                <input
                  type="password"
                  className="settings-form-control"
                  placeholder="New password"
                />
              </div>

              <div className="settings-form-group">
                <input
                  type="password"
                  className="settings-form-control"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="settings-btn-group">
                <button
                  type="submit"
                  className="settings-btn settings-btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : <><FaKey /> Update Security Settings</>}
                </button>
              </div>
            </form>
          </div>
        );

      case 'payment':
        return (
          <div className="settings-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title"><FaMoneyBillWave size={22} /> Payment Settings</h2>
              <p className="settings-section-description">Manage your payment methods and billing preferences.</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="settings-toggle">
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    name="autoRenew"
                    checked={formData.autoRenew}
                    onChange={handleInputChange}
                  />
                  <span className="settings-toggle-slider"></span>
                </label>
                <span className="settings-toggle-label">
                  Auto-renew Subscriptions {formData.autoRenew ? <FaToggleOn /> : <FaToggleOff />}
                </span>
              </div>

              <div className="settings-toggle">
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    name="savePaymentInfo"
                    checked={formData.savePaymentInfo}
                    onChange={handleInputChange}
                  />
                  <span className="settings-toggle-slider"></span>
                </label>
                <span className="settings-toggle-label">
                  Save Payment Information {formData.savePaymentInfo ? <FaToggleOn /> : <FaToggleOff />}
                </span>
              </div>

              <div className="settings-btn-group">
                <button
                  type="submit"
                  className="settings-btn settings-btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : <><FaSave /> Save Payment Settings</>}
                </button>
                <Link to="/payment-methods" className="settings-btn settings-btn-secondary">
                  <FaCreditCardAlt /> Manage Payment Methods
                </Link>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your account settings and preferences to customize your experience</p>
      </div>

      {successMessage && (
        <div className="settings-success-message">
          <FaCheck size={20} />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="settings-error-message">
          <FaExclamationTriangle size={20} />
          {errorMessage}
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-sidebar">
          <ul className="settings-nav">
            <li className="settings-nav-item">
              <button
                className={`settings-nav-link ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => handleTabChange('general')}
              >
                <FaCog className="settings-nav-icon" />
                General
              </button>
            </li>
            <li className="settings-nav-item">
              <button
                className={`settings-nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => handleTabChange('profile')}
              >
                <FaUserCircle className="settings-nav-icon" />
                Profile
              </button>
            </li>
            <li className="settings-nav-item">
              <button
                className={`settings-nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => handleTabChange('notifications')}
              >
                <FaBell className="settings-nav-icon" />
                Notifications
              </button>
            </li>
            <li className="settings-nav-item">
              <button
                className={`settings-nav-link ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => handleTabChange('security')}
              >
                <FaLock className="settings-nav-icon" />
                Security
              </button>
            </li>
            <li className="settings-nav-item">
              <button
                className={`settings-nav-link ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => handleTabChange('payment')}
              >
                <FaCreditCard className="settings-nav-icon" />
                Payment
              </button>
            </li>
          </ul>
        </div>

        <div className="settings-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
