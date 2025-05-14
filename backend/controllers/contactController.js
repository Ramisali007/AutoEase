// controllers/contactController.js
const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');
const notificationService = require('../utils/notificationService');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
exports.submitContactMessage = async (req, res) => {
  try {
    console.log('Contact message submission endpoint hit');
    console.log('Request body:', req.body);

    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create new contact message
    const contactMessage = await ContactMessage.create({
      name,
      email,
      phone: phone || '',
      subject,
      message
    });

    // Send notifications to all admin users
    try {
      // Find all admin users
      const adminUsers = await User.find({ role: 'admin' });

      // Send notification to each admin
      for (const admin of adminUsers) {
        await notificationService.newMessage(
          admin._id,
          `New contact message from ${name}: ${subject}`,
          contactMessage._id
        );
        console.log(`Contact message notification sent to admin: ${admin._id}`);
      }
    } catch (notificationError) {
      console.error('Error sending contact message notifications:', notificationError);
      // Continue with the contact message process even if notifications fail
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: contactMessage
    });
  } catch (error) {
    console.error('Contact message submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getAllContactMessages = async (req, res) => {
  try {
    const contactMessages = await ContactMessage.find({})
      .sort('-submissionDate');

    res.status(200).json({
      success: true,
      count: contactMessages.length,
      data: contactMessages
    });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
      error: error.message
    });
  }
};

// @desc    Get a single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getContactMessage = async (req, res) => {
  try {
    const contactMessage = await ContactMessage.findById(req.params.id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contactMessage
    });
  } catch (error) {
    console.error('Error fetching contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact message',
      error: error.message
    });
  }
};

// @desc    Mark contact message as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
exports.markAsRead = async (req, res) => {
  try {
    const contactMessage = await ContactMessage.findById(req.params.id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    contactMessage.isRead = true;
    await contactMessage.save();

    res.status(200).json({
      success: true,
      message: 'Contact message marked as read',
      data: contactMessage
    });
  } catch (error) {
    console.error('Error marking contact message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark contact message as read',
      error: error.message
    });
  }
};

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContactMessage = async (req, res) => {
  try {
    const contactMessage = await ContactMessage.findById(req.params.id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    await ContactMessage.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message',
      error: error.message
    });
  }
};
