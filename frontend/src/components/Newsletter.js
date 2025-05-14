import React, { useState } from 'react';
import Notification from './Notification';
import SubscriberService from '../services/subscriber.service';
import '../assets/Newsletter.css';

const Newsletter = () => {
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
    <div className="newsletter-container">
      <div className="newsletter-inner">
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
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default Newsletter;
