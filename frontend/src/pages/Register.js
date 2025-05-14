import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { decodeJWT } from '../utils/jwtDecode';
import '../assets/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    driverLicense: '',
    role: 'user'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = formData;
      const response = await register(userData);

      // Check if the user is a host
      if (response && response.role === 'host') {
        // Redirect to host setup page
        navigate('/host-setup');
      } else {
        // Redirect to login page for regular users
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      console.log('Google registration success response received');

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

      console.log('Google registration successful:', user.name);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error in Google registration process:', error);
      setError(`Failed to register with Google: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google Sign-In error:', error);
    setError(`Google Sign-In was unsuccessful: ${error?.error_description || error?.message || 'Unknown error'}`);
  };

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h2>Create an Account</h2>
        <p className="register-subtitle">Join AutoEase and start your journey</p>
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-control"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="form-control"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="driverLicense">Driver License Number</label>
            <input
              type="text"
              id="driverLicense"
              name="driverLicense"
              value={formData.driverLicense}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-control"
            >
              <option value="user">Customer</option>
              <option value="host">Car Host</option>
            </select>
            <small className="form-text text-muted">
              Select "Car Host" if you want to rent out your vehicles.
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
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
            context="signup"
            theme="filled_blue"
            text="signup_with"
            shape="rectangular"
            size="large"
            locale="en"
            ux_mode="popup"
            redirect_uri={window.location.origin}
          />
        </div>

        <div className="login-link">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
