// utils/notificationService.js
const Notification = require('../models/Notification');

let io;

/**
 * Initialize the notification service with Socket.IO instance
 * @param {Object} socketIo - Socket.IO instance
 */
exports.initialize = (socketIo) => {
  io = socketIo;
  console.log('Notification service initialized with Socket.IO');
};

/**
 * Create a new notification and emit a Socket.IO event
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Created notification
 */
exports.createNotification = async (notificationData) => {
  try {
    // Create notification in database
    const notification = await Notification.create(notificationData);

    // Emit Socket.IO event if io is initialized
    if (io) {
      // Emit to specific user's room
      io.to(`user_${notificationData.user}`).emit('notification', notification);
      
      console.log(`Notification emitted to user_${notificationData.user}`);
    } else {
      console.warn('Socket.IO not initialized, notification not emitted');
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create an account update notification
 * @param {string} userId - User ID
 * @param {string} message - Notification message
 * @param {string} link - Optional link to redirect to
 */
exports.accountUpdate = async (userId, message, link = '/profile') => {
  return this.createNotification({
    user: userId,
    type: 'account_update',
    title: 'Account Updated',
    message,
    link
  });
};

/**
 * Create a new message notification
 * @param {string} userId - User ID
 * @param {string} message - Notification message
 * @param {string} messageId - Message ID
 */
exports.newMessage = async (userId, message, messageId) => {
  return this.createNotification({
    user: userId,
    type: 'message',
    title: 'New Message',
    message,
    relatedId: messageId,
    onModel: 'Message',
    link: '/dashboard?tab=messages'
  });
};

/**
 * Create a booking notification
 * @param {string} userId - User ID
 * @param {string} message - Notification message
 * @param {string} bookingId - Booking ID
 * @param {string} status - Booking status
 */
exports.bookingUpdate = async (userId, message, bookingId, status) => {
  return this.createNotification({
    user: userId,
    type: 'booking',
    title: `Booking ${status}`,
    message,
    relatedId: bookingId,
    onModel: 'Booking',
    link: '/dashboard?tab=bookings'
  });
};

/**
 * Create a review notification
 * @param {string} userId - User ID
 * @param {string} message - Notification message
 * @param {string} reviewId - Review ID
 */
exports.reviewUpdate = async (userId, message, reviewId) => {
  return this.createNotification({
    user: userId,
    type: 'review',
    title: 'New Review',
    message,
    relatedId: reviewId,
    onModel: 'Review',
    link: '/dashboard?tab=reviews'
  });
};

/**
 * Create a system notification
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} link - Optional link to redirect to
 */
exports.systemNotification = async (userId, title, message, link = '/dashboard') => {
  return this.createNotification({
    user: userId,
    type: 'system',
    title,
    message,
    link
  });
};
