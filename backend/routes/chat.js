// routes/chat.js
const express = require('express');
const {
  sendMessage,
  getConversation,
  markAsRead,
  getAdmins,
  getUnreadCount
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Middleware to attach Socket.IO instance to request
const attachIO = (io) => (req, res, next) => {
  req.io = io;
  next();
};

// Initialize routes with Socket.IO
const initializeRoutes = (io) => {
  // All routes require authentication
  router.use(protect);
  router.use(attachIO(io));

  // Chat routes
  router.post('/messages', sendMessage);
  router.get('/messages/:userId', getConversation);
  router.put('/messages/:userId/read', markAsRead);
  router.get('/admins', getAdmins);
  router.get('/messages/unread/count', getUnreadCount);

  return router;
};

module.exports = initializeRoutes;
