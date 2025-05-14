import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { decodeJWT } from '../utils/jwtDecode';
import '../assets/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      console.log('Google login success response received');

      if (!credentialResponse) {
        throw new Error('No response received from Google');
      }

      // Check if we have a credential in the response
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      console.log('Received Google credential, preparing for authentication');

      // Decode the JWT token to get user information
      const decodedToken = decodeJWT(credentialResponse.credential);

      if (decodedToken) {
        console.log('Successfully decoded Google token');
      } else {
        console.log('Could not decode token, will send raw credential to server');
      }

      // Create authentication data object
      const authData = {
        credential: credentialResponse.credential
      };

      // Attempt to authenticate with the backend
      console.log('Sending Google credential to backend for authentication');
      const user = await googleLogin(authData);

      console.log('Google authentication successful:', user.name);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in Google login process:', error);
      setError(`Failed to login with Google: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google Sign-In error:', error);
    setError(`Google Sign-In was unsuccessful: ${error?.error_description || error?.message || 'Unknown error'}`);
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Sign in to access your account</p>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control"
            />
            <div className="forgot-password-link">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="google-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            useOneTap={false}
            flow="implicit"
            auto_select={false}
            context="signin"
            theme="filled_blue"
            text="signin_with"
            shape="rectangular"
            size="large"
            locale="en"
            ux_mode="popup"
            redirect_uri={window.location.origin}
          />
        </div>

        <div className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
