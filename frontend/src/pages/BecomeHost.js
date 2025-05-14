import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/BecomeHost.css';

const BecomeHost = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect hosts to their dashboard
  useEffect(() => {
    if (currentUser && (currentUser.role === 'host' || currentUser.role === 'admin')) {
      navigate('/host');
    }
  }, [currentUser, navigate]);

  return (
    <div className="become-host-container">
      <div className="become-host-header">
        <h1>Turn Your Car Into Income</h1>
        <p>Share your vehicle when you're not using it and earn up to $1,500 per month with AutoEase's trusted car sharing platform</p>
      </div>

      <div className="become-host-content">
        <div className="host-benefits">
          <h2>Why Host with AutoEase?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <span>$</span>
              </div>
              <h3>Earn Extra Income</h3>
              <p>Make money by sharing your car when you're not using it. Hosts earn an average of $500-$1,500 per month.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <span>🛡️</span>
              </div>
              <h3>Insurance Coverage</h3>
              <p>Your car is protected with our comprehensive insurance policy that covers up to $1 million in damages.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <span>📅</span>
              </div>
              <h3>Flexible Schedule</h3>
              <p>You decide when your car is available for rent. Block off dates when you need your car for personal use.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <span>👥</span>
              </div>
              <h3>Meet New People</h3>
              <p>Connect with travelers from around the world and become part of our growing community of hosts.</p>
            </div>
          </div>
        </div>

        <div className="host-steps">
          <h2>How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">
                <span>🚗</span>
              </div>
              <h3>List Your Car</h3>
              <p>Create a detailed listing with high-quality photos, comprehensive description, and your availability calendar.</p>
            </div>
            <div className="step">
              <div className="step-number">
                <span>✅</span>
              </div>
              <h3>Get Bookings</h3>
              <p>Travelers will browse available cars and request to book yours for their trips. You can review and approve each request.</p>
            </div>
            <div className="step">
              <div className="step-number">
                <span>🤝</span>
              </div>
              <h3>Meet & Greet</h3>
              <p>Meet the renter at the agreed location, hand over the keys, and provide any necessary instructions for your vehicle.</p>
            </div>
            <div className="step">
              <div className="step-number">
                <span>💳</span>
              </div>
              <h3>Get Paid</h3>
              <p>Receive secure payments directly to your account within 24 hours after each completed trip. No hassle, no waiting.</p>
            </div>
          </div>
        </div>

        <div className="host-cta">
          <h2>Ready to Start Hosting?</h2>
          <p>Join thousands of car owners who are already earning with AutoEase. It takes just a few minutes to create your listing and start receiving booking requests. Our dedicated support team is available 24/7 to help you succeed.</p>
          {currentUser ? (
            <Link to="/profile" className="btn">Update Your Profile to Host</Link>
          ) : (
            <Link to="/register" className="btn">Sign Up to Host</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomeHost;
