import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import '../assets/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewURL, setPreviewURL] = useState('');

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      // Validate email
      if (!email) {
        throw new Error('Please enter your email address');
      }

      // Call the forgotPassword method from AuthContext
      const response = await forgotPassword(email);

      // Check if we have a preview URL (for test emails)
      if (response.previewURL) {
        setPreviewURL(response.previewURL);
        setSuccess(response.message || 'Test email created. Click the link below to view it.');
      } else {
        // Show regular success message
        setSuccess(response.message || `Password reset instructions have been sent to ${email}. Please check your inbox and spam folder.`);
      }

      setEmail(''); // Clear the form
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form-container">
        <h2>Forgot Password</h2>
        <p className="forgot-password-subtitle">
          Enter your email address and we'll send you instructions to reset your password
        </p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            <FaCheckCircle style={{ marginRight: '10px', fontSize: '20px' }} />
            {success}
            {previewURL && (
              <div className="preview-link">
                <p>This is a test email. Click the link below to view it:</p>
                <a href={previewURL} target="_blank" rel="noopener noreferrer" className="preview-button">
                  View Test Email
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" /> Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Enter your registered email"
              disabled={isSubmitting || success}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting || success}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="back-to-login">
          <Link to="/login" className="back-link">
            <FaArrowLeft /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
