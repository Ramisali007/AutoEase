import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  FaBell, FaCheck, FaTrash, FaCheckDouble, FaInbox, FaSpinner,
  FaUser, FaEnvelope, FaCar, FaStar, FaExclamationCircle
} from 'react-icons/fa';
import '../assets/NotificationDropdown.css';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // Navigate to the link if provided
    if (notification.link) {
      navigate(notification.link);
    }

    // Close dropdown
    setIsOpen(false);
  };

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    markAllAsRead();
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'account_update':
        return <span className="notification-icon account">
          <FaUser />
        </span>;
      case 'message':
        return <span className="notification-icon message">
          <FaEnvelope />
        </span>;
      case 'booking':
        return <span className="notification-icon booking">
          <FaCar />
        </span>;
      case 'review':
        return <span className="notification-icon review">
          <FaStar />
        </span>;
      case 'system':
        return <span className="notification-icon system">
          <FaBell />
        </span>;
      default:
        return <span className="notification-icon">
          <FaExclamationCircle />
        </span>;
    }
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                className="mark-all-read-button"
                onClick={handleMarkAllAsRead}
                aria-label="Mark all as read"
              >
                <FaCheckDouble /> Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <FaSpinner className="fa-spin" />
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <FaInbox />
                <span>No notifications yet</span>
                <p>You'll see notifications about your account, bookings, and messages here.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    {getNotificationIcon(notification.type)}
                    <div className="notification-text">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">
                        {formatRelativeTime(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button
                        className="notification-action-button mark-read"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        aria-label="Mark as read"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      className="notification-action-button delete"
                      onClick={(e) => handleDeleteNotification(e, notification._id)}
                      aria-label="Delete notification"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
