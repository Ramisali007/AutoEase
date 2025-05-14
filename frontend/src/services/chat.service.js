import api from './api';

/**
 * Send a message to another user
 * @param {string} receiverId - Receiver user ID
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Response data
 */
const sendMessage = async (receiverId, message) => {
  try {
    const response = await api.post('/chat/messages', {
      receiverId,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get conversation with another user
 * @param {string} userId - Other user ID
 * @returns {Promise<Object>} - Response data with messages
 */
const getConversation = async (userId) => {
  try {
    const response = await api.get(`/chat/messages/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

/**
 * Mark messages from a user as read
 * @param {string} userId - Sender user ID
 * @returns {Promise<Object>} - Response data
 */
const markAsRead = async (userId) => {
  try {
    const response = await api.put(`/chat/messages/${userId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Get all admin users
 * @returns {Promise<Object>} - Response data with admin users
 */
const getAdmins = async () => {
  try {
    const response = await api.get('/chat/admins');
    console.log('Raw admin response:', response);

    // Handle different response formats
    if (response.data && response.data.data) {
      // If the response has a nested data property (standard API format)
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      // If the response data is directly the array
      return response.data;
    } else if (Array.isArray(response.data)) {
      // Fallback
      return response.data;
    } else {
      console.error('Unexpected admin response format:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching admins:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
};

/**
 * Get unread message count
 * @returns {Promise<Object>} - Response data with count
 */
const getUnreadCount = async () => {
  try {
    const response = await api.get('/chat/messages/unread/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Get users for host chat
 * @returns {Promise<Array>} - Array of users who have booked host's cars
 */
const getUsersForHost = async () => {
  try {
    // Get users who have booked the host's cars
    const response = await api.get('/host/chat/users');
    console.log('Raw users response for host:', response);

    // Handle different response formats
    if (response.data && response.data.data) {
      // If the response has a nested data property (standard API format)
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      // If the response data is directly the array
      return response.data;
    } else if (Array.isArray(response.data)) {
      // Fallback
      return response.data;
    } else {
      console.error('Unexpected users response format:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching users for host:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
};

/**
 * Get hosts for user chat
 * @returns {Promise<Array>} - Array of hosts whose cars the user has booked
 */
const getHostsForUser = async () => {
  try {
    // Get hosts whose cars the user has booked
    const response = await api.get('/user/chat/hosts');
    console.log('Raw hosts response for user:', response);

    // Handle different response formats
    if (response.data && response.data.data) {
      // If the response has a nested data property (standard API format)
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      // If the response data is directly the array
      return response.data;
    } else if (Array.isArray(response.data)) {
      // Fallback
      return response.data;
    } else {
      console.error('Unexpected hosts response format:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching hosts for user:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
};

const ChatService = {
  sendMessage,
  getConversation,
  markAsRead,
  getAdmins,
  getUnreadCount,
  getUsersForHost,
  getHostsForUser
};

export default ChatService;
