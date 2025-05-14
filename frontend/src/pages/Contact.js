import React, { useState } from 'react';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn
} from 'react-icons/fa';
import Notification from '../components/Notification';
import ContactService from '../services/contact.service';
import '../assets/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the service to submit the contact message
      const response = await ContactService.submitContactMessage(formData);

      if (response.success === false) {
        setNotification({
          type: 'error',
          message: response.message || 'Failed to send message. Please try again.'
        });
      } else {
        setNotification({
          type: 'success',
          message: response.message || 'Your message has been sent successfully. We will get back to you soon.'
        });

        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });

        // Show additional info if using localStorage
        if (response.fromLocalStorage) {
          console.log('Contact message saved to localStorage (database connection unavailable)');
        } else {
          console.log('Contact message saved to database successfully');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to send message. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="contact-container">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-overlay"></div>
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </div>

      <div className="contact-content">
        <div className="container">
          {/* Contact Info Section */}
          <div className="contact-info-section">
            <div className="contact-info-header">
              <h2>Get In Touch</h2>
              <div className="section-divider"></div>
              <p>Have questions about our services or need assistance? Contact us using any of the methods below.</p>
            </div>

            <div className="contact-info-cards">
              <div className="contact-card">
                <div className="contact-card-icon">
                  <FaMapMarkerAlt />
                </div>
                <h3>Our Location</h3>
                <p>42 Gulberg III, Lahore, Pakistan</p>
              </div>

              <div className="contact-card">
                <div className="contact-card-icon">
                  <FaPhone />
                </div>
                <h3>Phone Number</h3>
                <p>+92 325 220 4959</p>
              </div>

              <div className="contact-card">
                <div className="contact-card-icon">
                  <FaEnvelope />
                </div>
                <h3>Email Address</h3>
                <p>info@autoease.com</p>
              </div>

              <div className="contact-card">
                <div className="contact-card-icon">
                  <FaClock />
                </div>
                <h3>Working Hours</h3>
                <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                <p>Sat: 10:00 AM - 4:00 PM</p>
              </div>
            </div>

            <div className="contact-social">
              <h3>Connect With Us</h3>
              <p className="social-text">Follow us on social media for updates, promotions, and car rental tips!</p>
              <div className="social-icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
                  <FaFacebookF />
                  <span className="social-tooltip">Facebook</span>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon twitter">
                  <FaTwitter />
                  <span className="social-tooltip">Twitter</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                  <FaInstagram />
                  <span className="social-tooltip">Instagram</span>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon linkedin">
                  <FaLinkedinIn />
                  <span className="social-tooltip">LinkedIn</span>
                </a>
              </div>
              <div className="social-cta">
                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="twitter-btn">
                  <FaTwitter className="twitter-icon" /> Follow us on Twitter
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="contact-form-section">
            <div className="contact-form-header">
              <h2>Send Us a Message</h2>
              <div className="section-divider"></div>
              <p>Fill out the form below and we'll get back to you as soon as possible.</p>
            </div>

            {notification && (
              <Notification
                type={notification.type}
                message={notification.message}
                onClose={closeNotification}
              />
            )}

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="johndoe@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+92 300 1234567"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Booking Inquiry"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.5331328729354!2d74.35046491511794!3d31.51673995450472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391904f42f4b9d8f%3A0x2a1b3a0f5c9a1e0!2sGulberg%20III%2C%20Lahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1625123456789!5m2!1sen!2s"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="AutoEase Location"
        ></iframe>
      </div>

      {/* FAQ Section */}
      <div className="contact-faq">
        <div className="container">
          <div className="contact-faq-header">
            <h2>Frequently Asked Questions</h2>
            <div className="section-divider"></div>
            <p>Find quick answers to common questions about our services.</p>
          </div>

          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I book a car?</h3>
              <p>You can browse our available cars, select your preferred dates, and complete the booking process online. It's quick and easy!</p>
            </div>

            <div className="faq-item">
              <h3>What documents do I need?</h3>
              <p>You'll need a valid driver's license, a credit or debit card for payment, and proof of insurance.</p>
            </div>

            <div className="faq-item">
              <h3>Can I cancel my booking?</h3>
              <p>Yes, you can cancel your booking up to 24 hours before the scheduled pickup time for a full refund.</p>
            </div>

            <div className="faq-item">
              <h3>How do I become a host?</h3>
              <p>Visit our "Become a Host" page to learn how you can list your car and start earning extra income.</p>
            </div>
          </div>

          <div className="faq-cta">
            <p>Have more questions? Check out our comprehensive FAQ section.</p>
            <a href="/faq" className="faq-btn">View All FAQs</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
