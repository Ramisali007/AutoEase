import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaMediumM,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import Notification from './Notification';
import SubscriberService from '../services/subscriber.service';
import '../assets/Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      setNotification({
        type: 'error',
        message: 'Please enter your email address'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the service to subscribe (which tries API first, then localStorage)
      const response = await SubscriberService.subscribe(email);

      if (response.success === false) {
        setNotification({
          type: 'warning',
          message: response.message || 'This email is already subscribed to our newsletter'
        });
      } else {
        setNotification({
          type: 'success',
          message: response.message || 'Successfully subscribed to the newsletter!'
        });
        setEmail('');

        // Show additional info if using localStorage
        if (response.fromLocalStorage) {
          console.log('Subscription saved to localStorage (database connection unavailable)');
        } else {
          console.log('Subscription saved to database successfully');
        }
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to subscribe. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>AutoEase</h3>
          <p>Your trusted car rental service. We provide quality vehicles for your travel needs.</p>
          <div className="social-icons">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="social-icon" title="Facebook"><FaFacebookF /></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="social-icon" title="Instagram"><FaInstagram /></a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="social-icon" title="Twitter"><FaTwitter /></a>
            <a href="https://medium.com/" target="_blank" rel="noopener noreferrer" className="social-icon" title="Medium"><FaMediumM /></a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/cars">Cars</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Info</h3>
          <ul className="contact-info">
            <li><FaMapMarkerAlt className="contact-icon" /> 42 Gulberg III, Lahore, Pakistan</li>
            <li><FaPhone className="contact-icon" /> +92 325 220 4959</li>
            <li><FaEnvelope className="contact-icon" /> info@autoease.com</li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Newsletter</h3>
          <p>Subscribe to our newsletter for updates and offers.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your Email Address"
              aria-label="Email address for newsletter"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AutoEase. All Rights Reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
    </footer>
  );
};

export default Footer;
