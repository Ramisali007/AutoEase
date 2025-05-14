import api from './api';

// Helper function to save to localStorage
const saveToLocalStorage = (contactMessage) => {
  try {
    // Get existing contact messages
    const contactMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');

    // Add new contact message with timestamp
    const newMessage = {
      ...contactMessage,
      submissionDate: new Date().toISOString(),
      id: Date.now().toString() // Generate a unique ID
    };
    
    contactMessages.push(newMessage);
    localStorage.setItem('contactMessages', JSON.stringify(contactMessages));

    return {
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon.',
      data: newMessage,
      fromLocalStorage: true
    };
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw error;
  }
};

// Helper function to get contact messages from localStorage
const getFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('contactMessages') || '[]');
  } catch (error) {
    console.error('Error getting from localStorage:', error);
    return [];
  }
};

// Submit contact message
const submitContactMessage = async (contactData) => {
  try {
    // First try to save to the database via API
    console.log('Attempting to submit contact message:', contactData);
    console.log('API URL:', api.defaults.baseURL + '/contact');

    try {
      const response = await api.post('/contact', contactData);
      console.log('Contact message response from API:', response.data);

      // Also save to localStorage as backup
      saveToLocalStorage(contactData);

      return response.data;
    } catch (apiError) {
      console.error('API error, falling back to localStorage:', apiError);

      // If API fails, save to localStorage instead
      const localStorageResponse = saveToLocalStorage(contactData);

      return localStorageResponse;
    }
  } catch (error) {
    console.error('Error submitting contact message:', error);
    throw error;
  }
};

// Get all contact messages (admin only)
const getAllContactMessages = async () => {
  try {
    // Try to get contact messages from API first
    try {
      const response = await api.get('/contact');
      console.log('Got contact messages from API:', response.data);

      return response.data;
    } catch (apiError) {
      console.error('API error, falling back to localStorage:', apiError);

      // If API fails, get from localStorage instead
      const contactMessages = getFromLocalStorage();

      return {
        success: true,
        count: contactMessages.length,
        data: contactMessages,
        fromLocalStorage: true
      };
    }
  } catch (error) {
    console.error('Error getting contact messages:', error);
    throw error;
  }
};

const ContactService = {
  submitContactMessage,
  getAllContactMessages,
  getFromLocalStorage
};

export default ContactService;
