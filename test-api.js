// Simple script to test the API
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing API connection...');
    
    // Test the main API endpoint
    try {
      const response = await axios.get(`${API_URL}/test`);
      console.log('API test response:', response.data);
    } catch (error) {
      console.error('API test failed:', error.message);
    }
    
    // Test the user routes
    try {
      const userResponse = await axios.get(`${API_URL}/users/test`);
      console.log('User routes test response:', userResponse.data);
    } catch (error) {
      console.error('User routes test failed:', error.message);
    }
    
    console.log('API tests completed');
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();
