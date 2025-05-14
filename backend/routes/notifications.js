// routes/notifications.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// Get all notifications for the logged-in user
router.get('/', protect, getNotifications);

// Get unread notification count
router.get('/unread/count', protect, getUnreadCount);

// Mark notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

module.exports = router;
