import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import CustomModal from './CustomModal';
import Notification from './Notification';
import NotificationDropdown from './NotificationDropdown';
import { FaPuzzlePiece, FaQuestionCircle, FaSignOutAlt, FaBars, FaUser, FaMap, FaWindowRestore } from 'react-icons/fa';
import '../assets/Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { requestNotificationPermission } = useNotifications();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const hamburgerMenuRef = useRef(null);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);

    // Perform logout with a slight delay to show loading state
    setTimeout(() => {
      logout();
      setShowLogoutModal(false);
      setIsLoggingOut(false);

      // Show success notification
      setNotification({
        type: 'success',
        message: 'You have been successfully logged out'
      });

      // Navigate to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    }, 500);
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const toggleHamburgerMenu = () => {
    setShowHamburgerMenu(prev => !prev);
  };

  // Handle clicks outside the hamburger menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if the hamburger menu is shown and the click is outside both the button and dropdown
      if (showHamburgerMenu &&
          hamburgerMenuRef.current &&
          !hamburgerMenuRef.current.contains(event.target) &&
          !event.target.closest('.hamburger-dropdown') &&
          !event.target.closest('.hamburger-menu-btn')) {
        setShowHamburgerMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHamburgerMenu]);

  // Request notification permission when user logs in
  useEffect(() => {
    if (currentUser) {
      requestNotificationPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, [currentUser, requestNotificationPermission]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/images/logoo.png" alt="AutoEase Logo" className="navbar-logo-img" />
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink to="/" className="nav-link" end>Home</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/cars" className="nav-link">Cars</NavLink>
          </li>

          {currentUser && currentUser.role === 'admin' && (
            <li className="nav-item">
              <NavLink to="/admin" className="nav-link admin-link">Admin&nbsp;Panel</NavLink>
            </li>
          )}
          {currentUser && currentUser.role === 'host' && (
            <li className="nav-item">
              <NavLink to="/host" className="nav-link host-link">Host&nbsp;Panel</NavLink>
            </li>
          )}
          {currentUser && currentUser.role !== 'admin' && currentUser.role !== 'host' && (
            <li className="nav-item">
              <NavLink to="/dashboard" className="nav-link user-link">User&nbsp;Panel</NavLink>
            </li>
          )}
          <li className="nav-item">
            <NavLink to="/about" className="nav-link">About</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/contact" className="nav-link">Contact</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/faq" className="nav-link">FAQ</NavLink>
          </li>
          {currentUser && (
            <li className="nav-item">
              <button onClick={handleLogoutClick} className="nav-link logout-nav-link">
                Logout
              </button>
            </li>
          )}
        </ul>

        <div className="nav-auth">
          {/* Only show "Become a host" button if user is logged in and is not already a host */}
          {currentUser && currentUser.role !== 'host' && currentUser.role !== 'admin' && (
            <Link to="/become-host" className="host-btn">Become&nbsp;a&nbsp;host</Link>
          )}

          {currentUser ? (
            <>
              {/* Notification Dropdown */}
              <NotificationDropdown />

              <div className="user-menu">
                <div className="user-info">
                  {currentUser.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt={currentUser.name}
                      className="user-avatar"
                      onClick={(e) => e.stopPropagation()}
                      onError={(e) => {
                        console.error("Error loading profile image:", currentUser.profileImage);
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        // Show initials instead
                        const parent = e.target.parentNode;
                        const initial = document.createElement('div');
                        initial.className = 'user-initial';
                        initial.textContent = currentUser.name?.charAt(0) || 'U';
                        parent.appendChild(initial);
                      }}
                      style={{ pointerEvents: 'none' }}
                    />
                  ) : (
                    <div className="user-initial">{currentUser.name?.charAt(0) || 'U'}</div>
                  )}
                  <div className="user-details">
                    <span className="user-name">
                      {currentUser.name === 'John Doe' ? 'User' : currentUser.name}
                    </span>
                    <span className="user-role">
                      {currentUser.role === 'host' && 'Host'}
                    </span>
                  </div>
                </div>
                <div className="dropdown-menu">
                  {currentUser.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item">Admin Panel</Link>
                  )}
                  {currentUser.role === 'host' && (
                    <Link to="/host" className="dropdown-item">Host Panel</Link>
                  )}
                  {currentUser.role !== 'admin' && currentUser.role !== 'host' && (
                    <Link to="/dashboard" className="dropdown-item">User Panel</Link>
                  )}

                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/reviews" className="dropdown-item">My Reviews</Link>
                  <button onClick={handleLogoutClick} className="dropdown-item logout-btn">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-btn login-btn">Login</Link>
              <Link to="/register" className="auth-btn register-btn">Register</Link>
            </>
          )}

          {/* Hamburger Menu Button */}
          <div className="hamburger-menu-container" ref={hamburgerMenuRef}>
            <button
              className="hamburger-menu-btn"
              onClick={toggleHamburgerMenu}
              aria-label="Menu"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </div>

      {/* Hamburger Menu Dropdown - Moved outside navbar container for better positioning */}
      {showHamburgerMenu && (
        <div className="hamburger-dropdown">
          {currentUser && currentUser.role === 'admin' && (
            <Link to="/admin" className="hamburger-item">
              <FaUser className="hamburger-icon" />
              <span>Admin Panel</span>
            </Link>
          )}
          {currentUser && currentUser.role === 'host' && (
            <Link to="/host" className="hamburger-item">
              <FaUser className="hamburger-icon" />
              <span>Host Panel</span>
            </Link>
          )}
          {currentUser && currentUser.role !== 'admin' && currentUser.role !== 'host' && (
            <Link to="/dashboard" className="hamburger-item">
              <FaUser className="hamburger-icon" />
              <span>User Panel</span>
            </Link>
          )}

          {/* Settings button removed as requested */}
          <Link to="/features" className="hamburger-item">
            <FaPuzzlePiece className="hamburger-icon" />
            <span>Features</span>
          </Link>
          <Link to="/faq" className="hamburger-item">
            <FaQuestionCircle className="hamburger-icon" />
            <span>FAQ</span>
          </Link>
          {currentUser && currentUser.role === 'admin' && (
            <>
              <Link to="/map-debug" className="hamburger-item">
                <FaMap className="hamburger-icon" />
                <span>Maps Debug</span>
              </Link>
              <Link to="/google-maps-test" className="hamburger-item">
                <FaMap className="hamburger-icon" />
                <span>Maps Test</span>
              </Link>
              <Link to="/quick-action-demo" className="hamburger-item">
                <FaWindowRestore className="hamburger-icon" />
                <span>Quick Action Modals</span>
              </Link>
            </>
          )}
          <button onClick={handleLogoutClick} className="hamburger-item hamburger-logout">
            <FaSignOutAlt className="hamburger-icon" />
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <CustomModal
        show={showLogoutModal}
        onClose={handleCancelLogout}
        title="Confirm Logout"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={handleCancelLogout}
              disabled={isLoggingOut}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </>
        }
      >
        <div className="logout-confirmation">
          <p>Are you sure you want to logout?</p>
          <p>You will need to login again to access your account.</p>
        </div>
      </CustomModal>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
    </nav>
  );
};

export default Navbar;
