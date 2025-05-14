// This script demonstrates how to use the admin API with fetch
// You can run this with Node.js if you have node-fetch installed
// npm install node-fetch

const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';
let authToken = '';

// Step 1: Login as admin
async function loginAsAdmin() {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Login failed: ${data.message || 'Unknown error'}`);
    }
    
    console.log('Login successful!');
    console.log('User details:', {
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role
    });
    
    // Save the token for future requests
    authToken = data.token;
    console.log('\nAuth Token (copy this for Postman):\n', authToken);
    
    return data;
  } catch (error) {
    console.error('Error logging in:', error.message);
    throw error;
  }
}

// Step 2: Get all users (admin only)
async function getAllUsers() {
  if (!authToken) {
    console.error('No auth token available. Please login first.');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Failed to get users: ${data.message || 'Unknown error'}`);
    }
    
    console.log('\nAll Users:');
    data.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.role}`);
    });
    
    return data;
  } catch (error) {
    console.error('Error getting users:', error.message);
    throw error;
  }
}

// Run the demo
async function runDemo() {
  try {
    await loginAsAdmin();
    await getAllUsers();
  } catch (error) {
    console.error('Demo failed:', error.message);
  }
}

// Uncomment to run the demo
// runDemo();

// Instructions for Postman:
console.log(`
POSTMAN INSTRUCTIONS:

1. Login as Admin:
   - POST ${API_URL}/auth/login
   - Headers: Content-Type: application/json
   - Body (raw JSON): 
     {
       "email": "admin@example.com",
       "password": "admin123"
     }

2. Get All Users (copy token from step 1):
   - GET ${API_URL}/admin/users
   - Headers: Authorization: Bearer your-token-here
`);
