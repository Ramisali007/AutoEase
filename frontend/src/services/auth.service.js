import api from './api';

// Regular login with email and password
const login = async (email, password) => {
  try {
    console.log('Attempting login with:', { email, password });
    const response = await api.post('/auth/login', { email, password });
    console.log('Login response:', response.data);

    if (response.data.token) {
      // Ensure profile image is included
      const userData = {
        ...response.data,
        profileImage: response.data.profileImage || 'https://via.placeholder.com/150'
      };

      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));

      // Store token separately
      localStorage.setItem('token', response.data.token);

      // Verify token was stored correctly
      const storedToken = localStorage.getItem('token');
      if (storedToken === response.data.token) {
        console.log('Token saved to localStorage successfully:', storedToken);
      } else {
        console.error('Token storage verification failed!');
        console.error('Expected:', response.data.token);
        console.error('Actual:', storedToken);
      }

      // Test token retrieval
      setTimeout(() => {
        const testToken = localStorage.getItem('token');
        console.log('Token retrieval test after 100ms:', testToken ? 'Success' : 'Failed');
      }, 100);
    } else {
      console.error('No token received from server!');
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

// Register a new user
const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);

    // If registration is successful, store the user data and token
    if (response.data && response.data.token) {
      // Ensure profile image is included
      const user = {
        ...response.data,
        profileImage: response.data.profileImage || 'https://via.placeholder.com/150'
      };

      // Store user data
      localStorage.setItem('user', JSON.stringify(user));

      // Store token separately
      localStorage.setItem('token', response.data.token);

      console.log('User registered and logged in successfully');
    }

    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error;
  }
};

// Google login/signup
const googleLogin = async (googleData) => {
  try {
    console.log('Google login data received');

    // Validate input data
    if (!googleData) {
      throw new Error('No Google authentication data provided');
    }

    // Prepare the request data - be flexible about what we send
    let requestData = {};

    // If we have a credential, use it
    if (googleData.credential) {
      requestData.credential = googleData.credential;
      console.log('Using credential for authentication');
    }
    // If we have a tokenId, use it
    else if (googleData.tokenId) {
      requestData.tokenId = googleData.tokenId;
      console.log('Using tokenId for authentication');
    }
    // If we have an accessToken, use it
    else if (googleData.accessToken) {
      requestData.tokenId = googleData.accessToken;
      console.log('Using accessToken for authentication');
    }
    // If we have an idToken, use it
    else if (googleData.idToken) {
      requestData.tokenId = googleData.idToken;
      console.log('Using idToken for authentication');
    }
    // If we don't have any token, throw an error
    else {
      throw new Error('No valid authentication token found in Google data');
    }

    // Send the token to the backend for authentication
    console.log('Sending Google token to backend for authentication...');
    const response = await api.post('/auth/google', requestData);

    // Check if we have a valid response
    if (!response.data) {
      throw new Error('Empty response received from server');
    }

    // Check if the authentication was successful
    if (!response.data.success) {
      throw new Error(response.data.message || 'Authentication failed');
    }

    // Check if we have a token
    if (!response.data.token) {
      throw new Error('No authentication token received from server');
    }

    // Extract user data from the response
    const userData = {
      _id: response.data._id,
      name: response.data.name,
      email: response.data.email,
      role: response.data.role,
      profileImage: response.data.profileImage || 'https://via.placeholder.com/150',
      phone: response.data.phone || '',
      address: response.data.address || '',
      driverLicense: response.data.driverLicense || '',
      token: response.data.token
    };

    console.log('User authenticated successfully:', {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role
    });

    // Save the user data to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    console.log('User data saved to localStorage');

    return userData;
  } catch (error) {
    console.error('Error in Google authentication:', error);
    throw error;
  }
};

// Logout user
const logout = () => {
  // Clear all authentication-related data
  localStorage.removeItem('user');
  localStorage.removeItem('token');

  // Clear any other user-specific data that might be in localStorage
  const keysToKeep = ['theme', 'language']; // Keep app preferences

  // Get all keys in localStorage
  const keys = Object.keys(localStorage);

  // Remove user-specific data but keep app preferences
  keys.forEach(key => {
    if (!keysToKeep.includes(key) &&
        (key.startsWith('user_') ||
         key.includes('auth') ||
         key.includes('booking') ||
         key.includes('cart'))) {
      localStorage.removeItem(key);
    }
  });

  // Clear session storage as well
  sessionStorage.clear();

  // Clear any cookies related to authentication
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.trim().split('=');
    if (name.includes('token') || name.includes('auth') || name.includes('session')) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  });

  console.log('User successfully logged out');

  return true;
};

// Get current user
const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  console.log('getCurrentUser - User data:', user ? 'Present' : 'Missing');
  console.log('getCurrentUser - Token:', token ? 'Present' : 'Missing');

  // If we have a user but no token, or token but no user, something is wrong
  if ((user && !token) || (!user && token)) {
    console.warn('Inconsistent authentication state detected!');
    if (!token) {
      console.error('Token is missing but user data exists');
    }
    if (!user) {
      console.error('User data is missing but token exists');
    }
  }

  // Fix for the "John Doe" issue
  if (user && user.name === 'John Doe') {
    console.log('Fixing hardcoded "John Doe" name in getCurrentUser');
    // Replace with a generic name or try to get a better name
    user.name = 'User';

    // Save the updated user back to localStorage
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Only return the user if both user data and token exist
  return user && token ? user : null;
};

// Forgot password - request password reset
const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgotpassword', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password error:', error.response?.data || error.message);
    throw error;
  }
};

// Reset password with token
const resetPassword = async (resetToken, password) => {
  try {
    console.log('Auth service: Resetting password with token:', resetToken);

    // Make sure we have a valid token
    if (!resetToken) {
      console.error('No reset token provided');
      throw new Error('No reset token provided. Please request a new password reset link.');
    }

    // Log the full URL for debugging
    const url = `/auth/resetpassword/${resetToken}`;
    console.log('Reset password URL:', url);

    const response = await api.post(url, { password });
    console.log('Reset password response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Reset password error:', error);
    console.error('Error details:', error.response?.data || error.message);
    throw error;
  }
};

// Refresh user data from the server
const refreshUserData = async () => {
  try {
    console.log('Auth service: Refreshing user data from server');

    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found, cannot refresh user data');
      return null;
    }

    // Set up the request headers with the token
    const headers = { Authorization: `Bearer ${token}` };

    // Make the request to get the latest user data
    const response = await api.get('/auth/me', { headers });

    if (response.data) {
      console.log('User data refreshed successfully:', response.data);

      // Get the current user from localStorage to preserve the token
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');

      // Create an updated user object with the new data and the existing token
      const updatedUser = {
        ...response.data,
        token: token,
        // Ensure profileImage is included and not undefined
        profileImage: response.data.profileImage || 'https://via.placeholder.com/150'
      };

      // Save the updated user data to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('Updated user data saved to localStorage');

      return updatedUser;
    } else {
      console.error('No user data received from server');
      return null;
    }
  } catch (error) {
    console.error('Error refreshing user data:', error.response?.data || error.message);
    throw error;
  }
};

const AuthService = {
  login,
  register,
  googleLogin,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  refreshUserData
};

export default AuthService;
