import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaCar,
  FaDollarSign,
  FaHeadset,
  FaMapMarkerAlt,
  FaSearch,
  FaCalendarAlt,
  FaKey,
  FaRoad
} from 'react-icons/fa';
import Notification from '../components/Notification';
import '../assets/Home.css';

const Home = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [notification, setNotification] = useState(null);

  // Check for redirect message from location state
  useEffect(() => {
    if (location.state && location.state.message) {
      setNotification({
        type: 'error',
        message: location.state.message
      });

      // Clear the location state after showing the notification
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Function to close notification
  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <video className="hero-video" autoPlay muted loop>
          <source src="/bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Welcome to AutoEase</h1>
          <p>Your trusted car rental service for all your travel needs</p>
          <div className="hero-buttons">
            <Link to="/cars" className="home-btn">Browse Cars</Link>
            {!currentUser && (
              <Link to="/register" className="home-btn">Sign Up Now</Link>
            )}
            {currentUser && (
              <Link to="/dashboard" className="home-btn">My Dashboard</Link>
            )}
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose AutoEase?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon car-icon">
                <FaCar />
              </div>
              <h3>Wide Selection</h3>
              <p>Choose from our extensive fleet of vehicles to suit your needs and budget.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon price-icon">
                <FaDollarSign />
              </div>
              <h3>Best Prices</h3>
              <p>Competitive rates with no hidden fees or charges.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon support-icon">
                <FaHeadset />
              </div>
              <h3>24/7 Support</h3>
              <p>Our customer service team is available around the clock to assist you.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon location-icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Convenient Locations</h3>
              <p>Pick up and drop off your rental car at any of our convenient locations.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-icon search-icon">
                <FaSearch />
              </div>
              <h3>Choose Your Car</h3>
              <p>Browse our selection and find the perfect car for your needs.</p>
            </div>
            <div className="step">
              <div className="step-icon calendar-icon">
                <FaCalendarAlt />
              </div>
              <h3>Book Online</h3>
              <p>Make a reservation with our easy-to-use booking system.</p>
            </div>
            <div className="step">
              <div className="step-icon key-icon">
                <FaKey />
              </div>
              <h3>Pick Up Your Car</h3>
              <p>Visit our location to pick up your car at the scheduled time.</p>
            </div>
            <div className="step">
              <div className="step-icon road-icon">
                <FaRoad />
              </div>
              <h3>Enjoy Your Ride</h3>
              <p>Hit the road and enjoy your journey with our reliable vehicles.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>{currentUser ? 'Ready to Rent a Car?' : 'Ready to Get Started?'}</h2>
            <p>
              {currentUser
                ? `Welcome back, ${currentUser.name}! Browse our selection of cars and book your next rental.`
                : 'Join thousands of satisfied customers who trust AutoEase for their car rental needs.'}
            </p>
            {!currentUser ? (
              <Link to="/register" className="home-btn">Sign Up Now</Link>
            ) : (
              <Link to="/cars" className="home-btn">Browse Available Cars</Link>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
          duration={5000}
        />
      )}
    </div>
  );
};

export default Home;
