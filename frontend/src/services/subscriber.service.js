import api from './api';

// Helper function to save to localStorage (for backup only)
const saveToLocalStorage = (email) => {
  try {
    // Get existing subscribers
    const subscribers = JSON.parse(localStorage.getItem('subscribers') || '[]');

    // Check if already subscribed
    if (subscribers.includes(email)) {
      return {
        success: false,
        message: 'This email is already subscribed to our newsletter',
        fromLocalStorage: true
      };
    }

    // Add new subscriber
    subscribers.push(email);
    localStorage.setItem('subscribers', JSON.stringify(subscribers));

    return {
      success: true,
      message: 'Successfully subscribed to the newsletter',
      fromLocalStorage: true
    };
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    // Don't throw error, just return a failure response
    return {
      success: false,
      message: 'Error saving to local storage',
      fromLocalStorage: true
    };
  }
};

// Helper function to get subscribers from localStorage (for backup only)
const getFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('subscribers') || '[]');
  } catch (error) {
    console.error('Error getting from localStorage:', error);
    return [];
  }
};

// Subscribe to newsletter
const subscribe = async (email) => {
  try {
    // First try to save to the database via API
    console.log('Attempting to subscribe with email:', email);
    console.log('API URL:', api.defaults.baseURL + '/subscribers');

    try {
      const response = await api.post('/subscribers', { email });
      console.log('Subscription response from API:', response.data);

      // Also save to localStorage as backup
      saveToLocalStorage(email);

      return response.data;
    } catch (apiError) {
      console.error('API error, falling back to localStorage:', apiError);

      // Check if the error is because the email is already subscribed
      if (apiError.response && apiError.response.status === 400 &&
          apiError.response.data.message.includes('already subscribed')) {
        return {
          success: false,
          message: apiError.response.data.message || 'This email is already subscribed to our newsletter'
        };
      }

      // If API fails, save to localStorage instead as a fallback
      const localStorageResponse = saveToLocalStorage(email);

      if (!localStorageResponse.success) {
        return {
          success: false,
          message: localStorageResponse.message || 'Failed to subscribe to newsletter',
          fromLocalStorage: true
        };
      }

      return localStorageResponse;
    }
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return {
      success: false,
      message: error.message || 'Failed to subscribe to newsletter'
    };
  }
};

// Unsubscribe from newsletter
const unsubscribe = async (email) => {
  try {
    // Try to unsubscribe via API first
    try {
      console.log('Attempting to unsubscribe email:', email);
      const response = await api.delete(`/subscribers/${email}`);
      console.log('Unsubscribe response from API:', response.data);

      // Also remove from localStorage for consistency
      const subscribers = getFromLocalStorage();
      const updatedSubscribers = subscribers.filter(e => e !== email);
      localStorage.setItem('subscribers', JSON.stringify(updatedSubscribers));
      console.log('Updated localStorage after unsubscribe');

      return response.data;
    } catch (apiError) {
      console.error('API error during unsubscribe:', apiError);

      // Check if the error is because the email is not found
      if (apiError.response && apiError.response.status === 404) {
        return {
          success: false,
          message: 'This email is not subscribed to our newsletter'
        };
      }

      // If API fails, just remove from localStorage as a fallback
      const subscribers = getFromLocalStorage();
      const updatedSubscribers = subscribers.filter(e => e !== email);
      localStorage.setItem('subscribers', JSON.stringify(updatedSubscribers));
      console.log('Removed from localStorage as fallback');

      return {
        success: true,
        message: 'Successfully unsubscribed from the newsletter',
        fromLocalStorage: true
      };
    }
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return {
      success: false,
      message: error.message || 'Failed to unsubscribe from newsletter'
    };
  }
};

// Get all subscribers
const getAllSubscribers = async () => {
  try {
    // Try to get subscribers from API first
    try {
      console.log('Fetching subscribers from database...');
      const response = await api.get('/subscribers');
      console.log('Got subscribers from API:', response.data);

      // Also update localStorage with the latest data for backup
      if (response.data && Array.isArray(response.data.data)) {
        const apiSubscribers = response.data.data.map(sub => sub.email);
        localStorage.setItem('subscribers', JSON.stringify(apiSubscribers));
        console.log('Updated localStorage with database subscribers');
      }

      return response.data;
    } catch (apiError) {
      console.error('API error, falling back to localStorage:', apiError);

      // If API fails, get from localStorage instead as a fallback
      const subscribers = getFromLocalStorage();
      console.log('Using localStorage fallback with', subscribers.length, 'subscribers');

      return {
        success: true,
        data: subscribers.map(email => ({
          email,
          subscriptionDate: new Date(),
          active: true
        })),
        fromLocalStorage: true
      };
    }
  } catch (error) {
    console.error('Error getting subscribers:', error);
    // Return empty array instead of throwing error
    return {
      success: false,
      message: 'Failed to fetch subscribers',
      data: [],
      error: error.message
    };
  }
};

const SubscriberService = {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  getFromLocalStorage
};

export default SubscriberService;
