import api from './api';

/**
 * Get all notifications for the current user
 * @returns {Promise<Object>} - Notifications data
 */
const getNotifications = async () => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await api.get('/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count for the current user
 * @returns {Promise<number>} - Unread notification count
 */
const getUnreadCount = async () => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await api.get('/notifications/unread/count', {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data.count;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} - Updated notification
 */
const markAsRead = async (notificationId) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await api.put(`/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<Object>} - Response data
 */
const markAllAsRead = async () => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await api.put('/notifications/read-all', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} - Response data
 */
const deleteNotification = async (notificationId) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await api.delete(`/notifications/${notificationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

const NotificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};

export default NotificationService;
