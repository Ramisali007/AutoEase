import api from './api';

// Check MongoDB connection status
const checkDatabaseStatus = async () => {
  try {
    const response = await api.get('/db-status');
    console.log('Database status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error checking database status:', error);
    throw error;
  }
};

const DbService = {
  checkDatabaseStatus
};

export default DbService;
