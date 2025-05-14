// Script to test the make-all-cars-available endpoint
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// API URL
const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Admin credentials
const adminCredentials = {
  email: process.env.ADMIN_EMAIL || 'admin@autoease.com',
  password: process.env.ADMIN_PASSWORD || 'password123'
};

// Function to login and get token
async function loginAdmin() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, adminCredentials);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Function to make all cars available
async function makeAllCarsAvailable(token) {
  try {
    const response = await axios.put(
      `${API_URL}/admin/cars/make-all-available`,
      {}, // Empty body
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Make all cars available failed:', error.response?.data || error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log('Logging in as admin...');
    const token = await loginAdmin();
    console.log('Login successful');

    console.log('Making all cars available...');
    const result = await makeAllCarsAvailable(token);
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the script
main();
