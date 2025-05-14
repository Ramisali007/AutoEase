import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load theme preference from localStorage or user settings
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        console.log('Loading theme preference, currentUser:', currentUser?.email);

        // First check localStorage for theme preference
        const storedTheme = localStorage.getItem('theme');
        console.log('Stored theme from localStorage:', storedTheme);

        if (storedTheme) {
          setDarkMode(storedTheme === 'dark');
          setLoading(false);
          return;
        }

        // If user is logged in, try to get settings from API
        if (currentUser) {
          try {
            console.log('Fetching theme from API...');
            // Get the authentication token
            const token = localStorage.getItem('token');
            console.log('Token for theme settings request:', token ? 'Present' : 'Missing');

            if (!token) {
              console.warn('No authentication token found, using default theme');
              throw new Error('Authentication token is missing');
            }

            // Use the retry function to handle different API endpoints
            const response = await api.retryWithAlternateBaseURL({
              method: 'get',
              url: '/users/settings',
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            console.log('API settings response:', response.data);

            if (response.data && response.data.darkMode !== undefined) {
              console.log('Setting dark mode from API:', response.data.darkMode);
              setDarkMode(response.data.darkMode);
              // Save to localStorage for faster access next time
              localStorage.setItem('theme', response.data.darkMode ? 'dark' : 'light');
            } else {
              console.log('No darkMode setting found in API response');
              // Set default theme
              localStorage.setItem('theme', 'light');
            }
          } catch (error) {
            console.error('Failed to load theme from user settings:', error);
            if (error.response) {
              console.error('Error response:', error.response.data);
            }
            // Set default theme
            localStorage.setItem('theme', 'light');
          }
        } else {
          console.log('No user logged in, using default light theme');
          localStorage.setItem('theme', 'light');
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Set default theme
        localStorage.setItem('theme', 'light');
        setLoading(false);
      }
    };

    loadThemePreference();
  }, [currentUser]);

  // Apply theme to document when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  // Toggle theme function
  const toggleTheme = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    // Save to localStorage
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');

    // If user is logged in, save to API
    if (currentUser) {
      try {
        console.log('Saving theme setting to API:', newDarkMode);
        console.log('API URL:', api.defaults.baseURL);

        // Test API connection
        try {
          console.log('Testing API connection...');
          const testResponse = await api.get('/test');
          console.log('API test response:', testResponse.data);
        } catch (testError) {
          console.error('API test failed:', testError);
        }

        // Get the authentication token
        const token = localStorage.getItem('token');
        console.log('Token for getting settings:', token ? 'Present' : 'Missing');

        if (!token) {
          throw new Error('Authentication token is missing. Please log in again.');
        }

        // Get current settings first
        try {
          console.log('Getting current settings...');

          // Use the retry function to handle different API endpoints
          const getResponse = await api.retryWithAlternateBaseURL({
            method: 'get',
            url: '/users/settings',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log('Get settings response:', getResponse.data);

          const currentSettings = getResponse.data || {};

          // Update only the darkMode setting
          const updatedSettings = {
            ...currentSettings,
            darkMode: newDarkMode
          };

          console.log('Sending updated settings to API:', updatedSettings);

          // Use the retry function to handle different API endpoints
          console.log('Updating settings with retry capability...');
          const updateResponse = await api.retryWithAlternateBaseURL({
            method: 'put',
            url: '/users/settings',
            data: { settings: updatedSettings },
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log('Update settings response:', updateResponse.data);

          console.log('Theme setting saved successfully');
        } catch (settingsError) {
          console.error('Failed to get or update settings:', settingsError);
          if (settingsError.response) {
            console.error('Settings error response:', settingsError.response.data);
            console.error('Settings error status:', settingsError.response.status);
          }

          // Try a simpler approach - just update the darkMode setting directly
          console.log('Trying alternative approach...');
          try {
            // Use the retry function to handle different API endpoints
            await api.retryWithAlternateBaseURL({
              method: 'put',
              url: '/users/settings',
              data: { settings: { darkMode: newDarkMode } },
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            console.log('Alternative approach succeeded');
          } catch (altError) {
            console.error('Alternative approach failed:', altError);
          }
        }
      } catch (error) {
        console.error('Failed to save theme setting to API:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error message:', error.message);
        }
      }
    }
  };

  const value = {
    darkMode,
    toggleTheme,
    loading
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
