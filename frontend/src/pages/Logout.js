import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle } from 'react-icons/fa';
import '../assets/Logout.css';

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [logoutComplete, setLogoutComplete] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Perform logout
    const performLogout = async () => {
      try {
        await logout();
        setLogoutComplete(true);

        // Start countdown for redirect
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Redirect to login page after countdown
        const redirectTimer = setTimeout(() => {
          navigate('/login');
        }, 3000);

        // Clean up timers
        return () => {
          clearInterval(countdownInterval);
          clearTimeout(redirectTimer);
        };
      } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect even if there's an error
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <div className="logout-container">
      <div className="logout-content">
        {logoutComplete ? (
          <>
            <div className="logout-success-icon">
              <FaCheckCircle />
            </div>
            <h2>Successfully Logged Out</h2>
            <p>Thank you for using AutoEase.</p>
            <p>Redirecting to login page in {countdown} seconds...</p>
            <div className="logout-actions">
              <Link to="/login" className="login-now-btn">
                Login Now
              </Link>
              <Link to="/" className="home-btn">
                Return to Home
              </Link>
            </div>
          </>
        ) : (
          <>
            <h2>Logging Out</h2>
            <p>Please wait while we securely log you out...</p>
            <div className="spinner"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default Logout;
