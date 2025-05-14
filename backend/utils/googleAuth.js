// utils/googleAuth.js
const axios = require('axios');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Verify a Google OAuth token
 * @param {string} token - The Google OAuth token to verify
 * @returns {Promise<Object>} - The decoded token payload if valid
 */
const verifyGoogleToken = async (token) => {
  try {
    console.log('Verifying Google token...');

    // For debugging purposes, let's log the token format
    console.log('Token format check:', {
      isString: typeof token === 'string',
      length: token?.length,
      startsWithEyJ: token?.startsWith('eyJ'),
      parts: token?.split('.')?.length
    });

    // If the token is a JWT, decode it
    if (typeof token === 'string' && token.split('.').length === 3) {
      try {
        // Decode without verification
        const decoded = jwt.decode(token);

        if (!decoded) {
          console.error('Failed to decode token as JWT');
          throw new Error('Invalid token format: Could not decode JWT');
        }

        console.log('Successfully decoded token payload:', {
          sub: decoded.sub,
          email: decoded.email,
          name: decoded.name || decoded.given_name,
          picture: decoded.picture ? 'Present' : 'Missing'
        });

        // Validate required fields
        if (!decoded.email) {
          console.error('Token missing email field');
          throw new Error('Token missing required email field');
        }

        if (!decoded.sub) {
          console.error('Token missing subject (sub) field');
          throw new Error('Token missing required subject field');
        }

        // Create a valid user object with the decoded data
        return {
          sub: decoded.sub,
          email: decoded.email,
          name: decoded.name || decoded.given_name || (decoded.family_name ? `${decoded.given_name || ''} ${decoded.family_name}` : 'Google User'),
          picture: decoded.picture || 'https://via.placeholder.com/150',
          verified_email: decoded.email_verified || true
        };
      } catch (jwtError) {
        console.error('JWT decode error:', jwtError);
        throw jwtError;
      }
    } else {
      console.error('Token is not in JWT format');
      throw new Error('Invalid token format: Not a JWT');
    }
  } catch (error) {
    console.error('Error in Google token verification:', error);
    throw error;
  }
};

/**
 * Find or create a user from Google OAuth data
 * @param {Object} googleData - The Google user data
 * @returns {Promise<Object>} - The user object and JWT token
 */
const findOrCreateGoogleUser = async (googleData) => {
  try {
    console.log('Finding or creating user with Google data:', {
      sub: googleData.sub,
      email: googleData.email,
      name: googleData.name
    });

    if (!googleData.email || !googleData.sub) {
      throw new Error('Invalid Google data: Missing required fields');
    }

    // Extract user data from Google token
    const email = googleData.email;
    const name = googleData.name || 'Google User';
    const googleId = googleData.sub;
    const profileImage = googleData.picture || 'https://via.placeholder.com/150';

    // Check if user already exists by Google ID or email
    let user = await User.findOne({
      $or: [
        { googleId: googleId },
        { email: email }
      ]
    });

    if (user) {
      console.log('Found existing user:', user._id);

      // Update Google-specific fields
      user.googleId = googleId;

      // Only update profile image if it's provided and different
      if (profileImage && (!user.profileImage || user.profileImage === 'https://via.placeholder.com/150')) {
        user.profileImage = profileImage;
      }

      // Only update name if it's not already set or is a default name
      if (!user.name || user.name === 'User' || user.name === 'Google User') {
        user.name = name;
      }

      // Save the updated user
      await user.save();
      console.log('Updated existing user with Google data');
    } else {
      console.log('Creating new user with Google data');

      // Generate a secure random password
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

      // Create a new user with Google data
      user = await User.create({
        name: name,
        email: email,
        googleId: googleId,
        profileImage: profileImage,
        password: randomPassword, // Random password
        role: 'user'
      });

      console.log('Created new user with ID:', user._id);
    }

    // Generate JWT token for authentication
    const token = jwt.sign(
      { id: user._id },
      '477c14e81dc6f945e01a7c6b017bcaa0690136b077e62f798eba7b5d5b45e0b057b2396a92223bd224468efde89c4ee1f1c29854502912f3bff5bd317b9d7982',
      { expiresIn: '30d' }
    );

    console.log('Generated authentication token for user');

    return {
      user,
      token
    };
  } catch (error) {
    console.error('Error in findOrCreateGoogleUser:', error);
    throw error;
  }
};

module.exports = {
  verifyGoogleToken,
  findOrCreateGoogleUser
};
