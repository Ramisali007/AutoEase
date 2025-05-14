// Test script to verify the registration endpoint
const axios = require('axios');

// Test user data
const testUser = {
  name: 'API Test User',
  email: 'apitest@example.com',
  password: 'password123',
  phone: '9876543210',
  address: '456 API Test Street',
  driverLicense: 'APITEST123'
};

// Function to test the registration endpoint
const testRegistrationEndpoint = async () => {
  try {
    console.log('Testing registration endpoint with user data:', testUser);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser);
    
    console.log('Registration successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.error('Error testing registration endpoint:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Is the server running?');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
};

// Run the test
testRegistrationEndpoint();
