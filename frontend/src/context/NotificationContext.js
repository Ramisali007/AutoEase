import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (currentUser) {
      // Track if this is the first connection for this session
      const isFirstConnection = !localStorage.getItem('socket_connected');

      // Connect to Socket.IO server
      const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        withCredentials: true,
        path: '/socket.io/', // Match the path on the server
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
        query: {
          firstConnection: isFirstConnection.toString()
        }
      });

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Connected to notification server');
        console.log('Socket ID:', socketInstance.id);
        console.log('Transport:', socketInstance.io.engine.transport.name);

        // Mark as connected in localStorage to track first connection
        localStorage.setItem('socket_connected', 'true');

        // Authenticate with user ID
        socketInstance.emit('authenticate', currentUser._id);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Disconnected from notification server. Reason:', reason);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        console.log('Connection URL:', socketInstance.io.uri);
        console.log('Connection options:', socketInstance.io.opts);
      });

      socketInstance.on('connect_timeout', () => {
        console.error('Socket connection timeout');
      });

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('Reconnected to notification server after', attemptNumber, 'attempts');

        // Re-authenticate after reconnection
        if (currentUser) {
          socketInstance.emit('authenticate', currentUser._id);
        }
      });

      socketInstance.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
      });

      socketInstance.on('reconnect_failed', () => {
        console.error('Socket reconnection failed after all attempts');
      });

      // Save socket instance
      setSocket(socketInstance);

      // Clean up on unmount
      return () => {
        console.log('Cleaning up socket connection');
        socketInstance.disconnect();
      };
    }
  }, [currentUser]);

  // Listen for notifications
  useEffect(() => {
    if (socket) {
      socket.on('notification', (notification) => {
        console.log('New notification received:', notification);

        // Add the new notification to the state
        setNotifications(prev => [notification, ...prev]);

        // Increment unread count
        setUnreadCount(prev => prev + 1);

        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/images/logoo.png'
          });
        }
      });

      // Clean up listener on unmount
      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  // Fetch existing notifications when user logs in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (currentUser) {
        try {
          setLoading(true);

          // Get token from localStorage
          const token = localStorage.getItem('token');
          if (!token) {
            console.warn('No authentication token found for fetching notifications');
            setLoading(false);
            return;
          }

          // Fetch notifications
          const response = await api.get('/notifications', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data && response.data.data) {
            setNotifications(response.data.data);

            // Count unread notifications
            const unread = response.data.data.filter(n => !n.read).length;
            setUnreadCount(unread);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Reset state when user logs out
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found for marking notification as read');
        return;
      }

      // Call API to mark notification as read
      await api.put(`/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );

      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found for marking all notifications as read');
        return;
      }

      // Call API to mark all notifications as read
      await api.put('/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found for deleting notification');
        return;
      }

      // Call API to delete notification
      await api.delete(`/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));

      // Update unread count if needed
      const wasUnread = notifications.find(n => n._id === notificationId && !n.read);
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
