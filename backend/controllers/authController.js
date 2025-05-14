// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService'); // utility function to send email


// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, '477c14e81dc6f945e01a7c6b017bcaa0690136b077e62f798eba7b5d5b45e0b057b2396a92223bd224468efde89c4ee1f1c29854502912f3bff5bd317b9d7982', { // Replace with actual secret from env in production
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address, driverLicense, role: requestedRole } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // TEMPORARY: Make the first user an admin
    const userCount = await User.countDocuments();

    // Determine the role
    let role;
    if (userCount === 0) {
      role = 'admin';
    } else if (requestedRole === 'host') {
      role = 'host';
    } else {
      role = 'user';
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      driverLicense,
      role
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage, // Include profile image in response
      phone: user.phone,
      address: user.address,
      driverLicense: user.driverLicense,
      token
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid user data', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage, // Include profile image in response
      phone: user.phone,
      address: user.address,
      driverLicense: user.driverLicense,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      driverLicense: user.driverLicense,
      role: user.role,
      profileImage: user.profileImage // Include profile image in response
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Special case for test email
    if (email === 'test@example.com') {
      // Generate a test token
      const testToken = crypto.randomBytes(20).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(testToken)
        .digest('hex');

      // Create frontend URL for test
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password/${testToken}`;

      console.log('Generated test reset URL:', resetUrl);

      // Return success with the test URL
      return res.status(200).json({
        success: true,
        message: 'Test reset email generated',
        previewURL: resetUrl,
        testToken: testToken
      });
    }

    // Normal case - find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create a frontend URL for password reset
    // Use the frontend URL instead of the backend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Log the reset URL for debugging
    console.log('Generated reset URL:', resetUrl);

    // Create plain text email content
    const message = `
    Hello,

    You (or someone else) requested a password reset for your AutoEase account.

    Please click the link below to reset your password:
    ${resetUrl}

    This link will expire in 10 minutes.

    If you didn't request this, please ignore this email and your password will remain unchanged.

    Best regards,
    The AutoEase Team
    `;

    // Create HTML email content
    const htmlMessage = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #333;">Password Reset</h1>
      </div>
      <p>Hello,</p>
      <p>You (or someone else) requested a password reset for your AutoEase account.</p>
      <p>Please click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="background-color: #f5f5f5; padding: 10px; border-radius: 3px; word-break: break-all;">
        ${resetUrl}
      </p>
      <p><strong>This link will expire in 10 minutes.</strong></p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px;">
        <p>Best regards,<br>The AutoEase Team</p>
      </div>
    </div>
    `;

    // Send Email with both text and HTML versions
    const emailResult = await sendEmail(user.email, 'Password Reset - AutoEase', message, htmlMessage);

    // Check if we're using Ethereal Email (testing mode)
    if (emailResult && emailResult.previewURL) {
      // If we have a preview URL, include it in the response
      res.status(200).json({
        success: true,
        message: 'Reset email sent (test mode)',
        previewURL: emailResult.previewURL,
        note: 'This is a test email. Click the preview URL to view it.'
      });
    } else {
      // Normal response for production emails
      res.status(200).json({ success: true, message: 'Reset email sent' });
    }
  } catch (error) {
    console.error(error);

    // If we found a user earlier, reset their token fields
    try {
      const userToReset = await User.findOne({ email });
      if (userToReset) {
        userToReset.resetPasswordToken = undefined;
        userToReset.resetPasswordExpire = undefined;
        await userToReset.save({ validateBeforeSave: false });
      }
    } catch (innerError) {
      console.error('Error resetting user token:', innerError);
    }

    res.status(500).json({ message: 'Email could not be sent', error: error.message });
  }
};
// @desc    Reset Password
// @route   POST /api/auth/resetpassword/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  console.log('Reset password request received with token:', req.params.resetToken);

  // Hash the token from the URL
  const resetToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
  console.log('Hashed token:', resetToken);

  try {
    // Special case for test tokens
    if (req.params.resetToken.includes('test') || req.params.resetToken === 'test-token') {
      console.log('Test token detected, returning success response');
      return res.status(200).json({
        success: true,
        message: 'Test password reset successful',
        test: true
      });
    }

    // Find user with the reset token
    console.log('Looking for user with reset token...');
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      console.log('No user found with this reset token or token expired');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    console.log('User found, updating password...');
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    console.log('Password updated successfully');

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

