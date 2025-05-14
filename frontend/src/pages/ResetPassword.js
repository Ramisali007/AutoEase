import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import '../assets/ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { resetToken } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  // Log the token for debugging
  console.log('Reset token from URL:', resetToken);

  // If we're on the test route, use a test token
  const token = resetToken || 'test-token';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate passwords
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Call the resetPassword method from AuthContext
      console.log('Attempting to reset password with token:', token);
      const response = await resetPassword(token, password);

      // Show success message and prepare for redirect
      setSuccess(true);

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form-container">
        {success ? (
          <div className="reset-success">
            <FaCheckCircle className="success-icon" />
            <h2>Password Reset Successful</h2>
            <p>Your password has been reset successfully.</p>
            <p>You will be redirected to the login page in a few seconds...</p>
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <h2>Reset Your Password</h2>
            <p className="reset-password-subtitle">
              Enter your new password below
            </p>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">
                  <FaLock className="input-icon" /> New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                  placeholder="Enter your new password"
                  disabled={isSubmitting}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FaLock className="input-icon" /> Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control"
                  placeholder="Confirm your new password"
                  disabled={isSubmitting}
                  required
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="back-to-login">
              <Link to="/login" className="back-link">
                <FaArrowLeft /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
