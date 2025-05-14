import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    console.log('AuthContext init - Token:', token ? 'Present' : 'Missing');

    const user = AuthService.getCurrentUser();
    console.log('AuthContext init - User:', user ? 'Present' : 'Missing');

    if (user && token) {
      console.log('AuthContext: User is authenticated');
      setCurrentUser(user);
    } else if (!user && token) {
      console.warn('AuthContext: Token exists but no user data found');
      // Clear the token since it's not valid without user data
      localStorage.removeItem('token');
    } else if (user && !token) {
      console.warn('AuthContext: User data exists but no token found');
      // Clear the user data since it's not valid without a token
      localStorage.removeItem('user');
    } else {
      console.log('AuthContext: User is not authenticated');
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login...');
      const userData = await AuthService.login(email, password);

      // Verify token is in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('AuthContext: No token found after login!');
        throw new Error('Authentication failed: No token received');
      }

      console.log('AuthContext: Login successful, token present');
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error('AuthContext login error:', error);
      throw error;
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const userData = await AuthService.googleLogin(googleData);
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      return await AuthService.register(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      return await AuthService.forgotPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      return await AuthService.resetPassword(resetToken, password);
    } catch (error) {
      throw error;
    }
  };

  // Add a function to refresh user data from the server
  const refreshUserData = async () => {
    try {
      console.log('AuthContext: Refreshing user data from server...');
      const userData = await AuthService.refreshUserData();
      if (userData) {
        console.log('AuthContext: User data refreshed successfully');
        setCurrentUser(userData);
        return userData;
      }
    } catch (error) {
      console.error('AuthContext: Error refreshing user data:', error);
      throw error;
    }
  };

  // Add a function to update the current user data
  const updateCurrentUser = (userData) => {
    console.log('AuthContext: Updating current user data:', userData);
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    // Update state
    setCurrentUser(userData);
  };

  const value = {
    currentUser,
    login,
    googleLogin,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUserData,
    updateCurrentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
