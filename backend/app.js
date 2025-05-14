// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const notificationService = require('./utils/notificationService');

// Route imports
const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const hostRoutes = require('./routes/host');
const dbStatusRoutes = require('./routes/db-status');
const userRoutes = require('./routes/users');
const userChatRoutes = require('./routes/user');
const subscriberRoutes = require('./routes/subscribers');
const contactRoutes = require('./routes/contact');
const notificationRoutes = require('./routes/notifications');
const initializeChatRoutes = require('./routes/chat');

// Init app
const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io/' // Explicitly set the path
});

// Connect to database
connectDB();

// Initialize Socket.IO
notificationService.initialize(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Log connection details for debugging
  console.log('Socket.IO connection details:');
  console.log('- Transport:', socket.conn.transport.name);
  console.log('- Headers:', socket.handshake.headers);
  console.log('- Query:', socket.handshake.query);

  // Authenticate user and join their room
  socket.on('authenticate', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} authenticated and joined room`);

      // We'll create a real notification in the database instead of a test one
      // This ensures it has a valid MongoDB ObjectId
      const mongoose = require('mongoose');
      const Notification = require('./models/Notification');

      // Only create a welcome notification for new socket connections
      // to avoid spamming the user with notifications
      if (socket.handshake.query.firstConnection === 'true') {
        // Create a real notification in the database
        Notification.create({
          user: userId,
          type: 'system',
          title: 'Welcome to AutoEase',
          message: 'You are now connected to the real-time notification system.',
          read: false,
          link: '/dashboard'
        })
        .then(notification => {
          // Emit the notification to the user
          socket.emit('notification', notification);
          console.log(`Welcome notification sent to user ${userId}`);
        })
        .catch(err => {
          console.error('Error creating welcome notification:', err);
        });
      }
    }
  });

  // Handle chat messages
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, message, senderId } = data;

      if (receiverId && message && senderId) {
        console.log(`User ${senderId} sending message to ${receiverId}: ${message.substring(0, 30)}...`);

        // Emit to receiver's room
        socket.to(`user_${receiverId}`).emit('receive_message', {
          senderId,
          message,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { receiverId, senderId } = data;
    if (receiverId && senderId) {
      socket.to(`user_${receiverId}`).emit('user_typing', { senderId });
    }
  });

  // Handle stop typing indicator
  socket.on('stop_typing', (data) => {
    const { receiverId, senderId } = data;
    if (receiverId && senderId) {
      socket.to(`user_${receiverId}`).emit('user_stop_typing', { senderId });
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket.IO error:', error);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });
});

// Middleware - Apply CORS before Socket.IO routes
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Test route to check if server is running
app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'API is working!' });
});

// We're now using the proper user route for password changes in /api/users/change-password

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/db-status', dbStatusRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userChatRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', initializeChatRoutes(io));

// Not found handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.IO`);
  console.log(`Socket.IO path: ${io.path()}`);
  console.log(`CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

module.exports = app;