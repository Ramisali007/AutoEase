// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const notificationService = require('../utils/notificationService');
const { profileImageUpload, documentUpload } = require('../utils/fileUpload');
const path = require('path');
const fs = require('fs');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    // Don't allow password updates through this endpoint
    const { password, role, ...updateData } = req.body;

    // Find the user by ID (from the authenticated user)
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });

    // Save the updated user
    await user.save();

    // Send real-time notification
    try {
      await notificationService.accountUpdate(
        req.user._id,
        'Your profile information has been successfully updated.',
        '/profile'
      );
      console.log('Profile update notification sent successfully');
    } catch (notificationError) {
      console.error('Error sending profile update notification:', notificationError);
      // Continue with the profile update process even if notification fails
    }

    // Return the updated user without password
    const updatedUser = await User.findById(req.user._id).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update profile', error: error.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    console.log('Received settings update request:', req.body);

    // Find the user by ID (from the authenticated user)
    const user = await User.findById(req.user._id);

    if (!user) {
      console.log('User not found:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    // If user doesn't have settings object yet, create it
    if (!user.settings) {
      user.settings = {};
    }

    // Update settings fields
    const { settings } = req.body;

    if (settings) {
      console.log('Updating settings with:', settings);

      // Handle each setting individually to ensure proper validation
      if (settings.language !== undefined &&
          ['english', 'spanish', 'french', 'german', 'chinese', 'japanese'].includes(settings.language)) {
        user.settings.language = settings.language;
      }

      if (settings.darkMode !== undefined) {
        user.settings.darkMode = Boolean(settings.darkMode);
      }

      if (settings.emailNotifications !== undefined) {
        user.settings.emailNotifications = Boolean(settings.emailNotifications);
      }

      if (settings.smsNotifications !== undefined) {
        user.settings.smsNotifications = Boolean(settings.smsNotifications);
      }

      if (settings.appNotifications !== undefined) {
        user.settings.appNotifications = Boolean(settings.appNotifications);
      }

      if (settings.twoFactorAuth !== undefined) {
        user.settings.twoFactorAuth = Boolean(settings.twoFactorAuth);
      }

      if (settings.autoRenew !== undefined) {
        user.settings.autoRenew = Boolean(settings.autoRenew);
      }

      if (settings.savePaymentInfo !== undefined) {
        user.settings.savePaymentInfo = Boolean(settings.savePaymentInfo);
      }

      if (settings.defaultCurrency !== undefined &&
          ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].includes(settings.defaultCurrency)) {
        user.settings.defaultCurrency = settings.defaultCurrency;
      }
    }

    console.log('Updated user settings:', user.settings);

    // Save the updated user
    await user.save();

    // Send real-time notification
    try {
      await notificationService.accountUpdate(
        req.user._id,
        'Your account settings have been successfully updated.',
        '/settings'
      );
      console.log('Settings update notification sent successfully');
    } catch (notificationError) {
      console.error('Error sending settings update notification:', notificationError);
      // Continue with the settings update process even if notification fails
    }

    // Return the updated user settings
    res.json({
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(400).json({ message: 'Failed to update settings', error: error.message });
  }
};

// @desc    Get user settings
// @route   GET /api/users/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    console.log('Getting settings for user:', req.user._id);

    // Find the user by ID (from the authenticated user)
    const user = await User.findById(req.user._id);

    if (!user) {
      console.log('User not found:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Retrieved user settings:', user.settings || {});

    // Return the user settings
    res.json(user.settings || {});
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(400).json({ message: 'Failed to get settings', error: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  console.log('Change password endpoint hit');
  try {
    console.log('Request body:', req.body);
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate request
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    // Find the user by ID and include the password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Set the new password
    user.password = newPassword;

    // Save the user (password will be hashed by the pre-save hook in the User model)
    await user.save();

    // Send real-time notification
    try {
      await notificationService.accountUpdate(
        req.user._id,
        'Your password has been successfully changed.',
        '/profile'
      );
      console.log('Password change notification sent successfully');
    } catch (notificationError) {
      console.error('Error sending password change notification:', notificationError);
      // Continue with the password change process even if notification fails
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(400).json({ message: 'Failed to change password', error: error.message });
  }
};

// @desc    Upload profile image
// @route   POST /api/users/profile-image
// @access  Private
exports.uploadProfileImage = (req, res) => {
  profileImageUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file' });
      }

      // Get the file path - use full URL for frontend access
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const filePath = `/uploads/profile/${req.file.filename}`;
      const fullImageUrl = `${baseUrl}${filePath}`;

      // Find the user
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // If user already has a profile image that's not the default, delete it
      if (user.profileImage &&
          user.profileImage !== 'https://via.placeholder.com/150' &&
          user.profileImage.startsWith('/uploads/')) {
        try {
          const oldFilePath = path.join(__dirname, '..', user.profileImage);
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (error) {
          console.error('Error deleting old profile image:', error);
        }
      }

      // Update user profile image - store the full URL in the database
      user.profileImage = fullImageUrl;
      await user.save();

      // Send notification
      try {
        await notificationService.accountUpdate(
          req.user._id,
          'Your profile picture has been updated.',
          '/profile'
        );
      } catch (notificationError) {
        console.error('Error sending profile image update notification:', notificationError);
      }

      res.status(200).json({
        success: true,
        message: 'Profile image uploaded successfully',
        profileImage: fullImageUrl
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  });
};

// @desc    Upload document
// @route   POST /api/users/documents
// @access  Private
exports.uploadDocument = (req, res) => {
  documentUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file' });
      }

      // Get the file path - use full URL for frontend access
      const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
      const filePath = `/uploads/documents/${req.file.filename}`;
      const fullDocUrl = `${baseUrl}${filePath}`;

      // Find the user
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Add document to user's documents array - store the full URL
      user.documents.push({
        name: req.file.originalname,
        path: fullDocUrl,
        type: path.extname(req.file.originalname).substring(1)
      });

      await user.save();

      // Send notification
      try {
        await notificationService.accountUpdate(
          req.user._id,
          'A new document has been uploaded to your account.',
          '/profile'
        );
      } catch (notificationError) {
        console.error('Error sending document upload notification:', notificationError);
      }

      res.status(200).json({
        success: true,
        message: 'Document uploaded successfully',
        document: user.documents[user.documents.length - 1]
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  });
};

// @desc    Get user documents
// @route   GET /api/users/documents
// @access  Private
exports.getUserDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      count: user.documents.length,
      data: user.documents
    });
  } catch (error) {
    console.error('Error getting user documents:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete document
// @route   DELETE /api/users/documents/:id
// @access  Private
exports.deleteDocument = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find document by ID
    const document = user.documents.id(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Delete file from filesystem
    try {
      const filePath = path.join(__dirname, '..', document.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting document file:', error);
    }

    // Remove document from user's documents array
    document.deleteOne();
    await user.save();

    // Send notification
    try {
      await notificationService.accountUpdate(
        req.user._id,
        'A document has been deleted from your account.',
        '/profile'
      );
    } catch (notificationError) {
      console.error('Error sending document deletion notification:', notificationError);
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
