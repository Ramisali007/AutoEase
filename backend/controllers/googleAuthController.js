// controllers/googleAuthController.js
const { verifyGoogleToken, findOrCreateGoogleUser } = require('../utils/googleAuth');

/**
 * @desc    Authenticate with Google
 * @route   POST /api/auth/google
 * @access  Public
 */
exports.googleAuth = async (req, res) => {
  try {
    console.log('Google auth request received');
    console.log('Request body type:', typeof req.body);

    // Extract token from request - be flexible about where it might be
    let tokenId = null;

    // Check in request body
    if (req.body && req.body.tokenId) {
      tokenId = req.body.tokenId;
      console.log('Found token in request body (tokenId field)');
    }
    // Check in credential field (used by newer Google OAuth)
    else if (req.body && req.body.credential) {
      tokenId = req.body.credential;
      console.log('Found token in credential field');
    }
    // Check if the entire body is the token
    else if (typeof req.body === 'string') {
      tokenId = req.body;
      console.log('Request body is the token');
    }
    // Check if token is in a nested object
    else if (req.body && typeof req.body === 'object') {
      // Try to find a token in any field
      for (const key in req.body) {
        if (typeof req.body[key] === 'string' &&
            (req.body[key].startsWith('eyJ') || key.toLowerCase().includes('token'))) {
          tokenId = req.body[key];
          console.log(`Found potential token in field: ${key}`);
          break;
        }
      }
    }

    if (!tokenId) {
      console.error('No token found in request');
      return res.status(400).json({
        success: false,
        message: 'No Google authentication token provided'
      });
    }

    // Process the token to get user data
    console.log('Verifying Google token...');
    const googleUserData = await verifyGoogleToken(tokenId);

    if (!googleUserData || !googleUserData.email) {
      console.error('Invalid Google user data');
      return res.status(400).json({
        success: false,
        message: 'Invalid Google user data'
      });
    }

    console.log('Google token verified, creating/finding user...');

    // Find or create the user based on Google data
    const { user, token } = await findOrCreateGoogleUser(googleUserData);

    if (!user || !token) {
      console.error('Failed to create/find user');
      return res.status(500).json({
        success: false,
        message: 'Failed to process user authentication'
      });
    }

    console.log('User authenticated successfully:', {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    // Return user data and token
    return res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || 'https://via.placeholder.com/150',
      token
    });
  } catch (error) {
    console.error('Error in Google authentication:', error);

    return res.status(401).json({
      success: false,
      message: 'Google authentication failed',
      error: error.message
    });
  }
};
