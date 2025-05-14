// controllers/chatController.js
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const notificationService = require('../utils/notificationService');

// @desc    Send a new chat message
// @route   POST /api/chat/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    
    if (!receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and message content are required'
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Create new message
    const chatMessage = await ChatMessage.create({
      sender: req.user._id,
      receiver: receiverId,
      message
    });

    // Populate sender information
    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate('sender', 'name email profileImage role')
      .populate('receiver', 'name email profileImage role');

    // Send notification to receiver
    try {
      await notificationService.newMessage(
        receiverId,
        `New message from ${req.user.name}`,
        chatMessage._id
      );
    } catch (notificationError) {
      console.error('Error sending message notification:', notificationError);
      // Continue with the message process even if notification fails
    }

    // Emit socket event for real-time update
    req.io.to(`user_${receiverId}`).emit('new_message', populatedMessage);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/chat/messages/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get messages where current user is either sender or receiver
    const messages = await ChatMessage.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
    .sort('createdAt')
    .populate('sender', 'name email profileImage role')
    .populate('receiver', 'name email profileImage role');

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/messages/:userId/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Mark all messages from userId to current user as read
    const result = await ChatMessage.updateMany(
      { sender: userId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// @desc    Get all admin users
// @route   GET /api/chat/admins
// @access  Private
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('name email profileImage');
    
    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users',
      error: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/chat/messages/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await ChatMessage.countDocuments({
      receiver: req.user._id,
      isRead: false
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread message count',
      error: error.message
    });
  }
};
