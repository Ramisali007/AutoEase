import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const TestReset = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testToken, setTestToken] = useState('');
  const [testUrl, setTestUrl] = useState('');

  useEffect(() => {
    const generateTestToken = async () => {
      try {
        setLoading(true);
        // Generate a test token by calling the backend directly
        const response = await axios.post('http://localhost:5000/api/auth/forgotpassword', {
          email: 'test@example.com' // Use a test email
        });

        if (response.data.previewURL) {
          // Extract the token from the preview URL
          const url = response.data.previewURL;
          setTestUrl(url);
          
          // Extract the token from the URL
          const tokenMatch = url.match(/reset-password\/([^\/]+)/);
          if (tokenMatch && tokenMatch[1]) {
            setTestToken(tokenMatch[1]);
          } else {
            setError('Could not extract token from URL');
          }
        } else {
          setError('No preview URL returned');
        }
      } catch (err) {
        setError(err.message || 'Failed to generate test token');
      } finally {
        setLoading(false);
      }
    };

    generateTestToken();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test Reset Password</h1>
      
      {loading ? (
        <p>Loading test token...</p>
      ) : error ? (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <p>Error: {error}</p>
        </div>
      ) : (
        <div>
          <p>A test token has been generated for testing the reset password functionality.</p>
          
          {testToken && (
            <div style={{ marginTop: '20px' }}>
              <h3>Test Token:</h3>
              <pre style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '5px',
                overflowX: 'auto'
              }}>
                {testToken}
              </pre>
              
              <h3>Test Reset URL:</h3>
              <div style={{ 
                background: '#f5f5f5', 
                padding: '10px', 
                borderRadius: '5px',
                marginBottom: '20px',
                wordBreak: 'break-all'
              }}>
                {`http://localhost:3000/reset-password/${testToken}`}
              </div>
              
              <Link 
                to={`/reset-password/${testToken}`}
                style={{
                  display: 'inline-block',
                  background: '#007bff',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  marginRight: '10px'
                }}
              >
                Test Reset Password
              </Link>
              
              <Link 
                to="/login"
                style={{
                  display: 'inline-block',
                  background: '#6c757d',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  textDecoration: 'none'
                }}
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestReset;
