// Simple script to start the server
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting backend server...');

// Path to the backend app.js file
const backendPath = path.join(__dirname, 'backend', 'app.js');
console.log('Backend path:', backendPath);

// Check if the file exists
if (!fs.existsSync(backendPath)) {
  console.error('Error: Backend app.js file not found at:', backendPath);
  console.log('Current directory:', __dirname);
  console.log('Files in current directory:', fs.readdirSync(__dirname));
  console.log('Files in backend directory (if exists):',
    fs.existsSync(path.join(__dirname, 'backend')) ?
    fs.readdirSync(path.join(__dirname, 'backend')) :
    'Backend directory not found');
  process.exit(1);
}

// Start the server
const server = spawn('node', [backendPath], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
});

console.log('Server process started with PID:', server.pid);
