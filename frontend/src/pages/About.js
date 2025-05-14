import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaHandshake,
  FaLeaf,
  FaShieldAlt,
  FaCar,
  FaMapMarkedAlt,
  FaUserTie,
  FaUserGraduate,
  FaUserCog
} from 'react-icons/fa';
import YouTubeVideo from '../components/YouTubeVideo';
import '../assets/About.css';

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content">
          <h1>About AutoEase</h1>
          <p>Revolutionizing the way you rent and share cars</p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="about-section story-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Story</h2>
            <div className="section-divider"></div>
          </div>
          <div className="story-content">
            <div className="story-text">
              <h3>From Idea to Innovation</h3>
              <p>
                Founded in 2023, AutoEase began with a simple idea: make car rentals easy, affordable, and accessible to everyone.
                Our founders recognized the frustrations of traditional car rental services – the long lines, paperwork, hidden fees,
                and limited options.
              </p>
              <p>
                What started as a small operation with just five cars has grown into a thriving platform connecting car owners
                with people who need vehicles for their daily commute, business trips, or vacation adventures. Today, AutoEase
                serves thousands of customers across the country, offering a diverse fleet of vehicles to suit every need and budget.
              </p>
              <p>
                Our journey has been driven by a commitment to innovation, customer satisfaction, and community building.
                We're proud of how far we've come, but we're even more excited about the road ahead.
              </p>

              <h3 className="video-heading">Watch Our Story</h3>
              <YouTubeVideo
                videoId="aCLcVRFIfGk"
                title="AutoEase Car Rental Service"
                duration="3:42"
                likes="1.2K"
                hearts="458"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="about-section mission-section">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <h2 style={{ textAlign: 'center', width: '100%', display: 'block' }}>Our Mission</h2>
            <div className="section-divider"></div>
          </div>
          <div className="mission-content">
            <div className="mission-text">
              <p>
                At AutoEase, our mission is to transform the car rental experience through technology,
                transparency, and trust. We aim to create a seamless platform where car owners can
                monetize their vehicles when not in use, and renters can find the perfect car for any occasion
                without the hassle of traditional rental services.
              </p>
              <p>
                We believe in a future where access to transportation is flexible, affordable, and sustainable.
                By connecting people and cars, we're not just facilitating rentals – we're building a community
                of drivers who share our vision for a more efficient and environmentally conscious approach to mobility.
              </p>
            </div>
            <div className="mission-values">
              <div className="value-card">
                <div className="value-icon">
                  <FaUsers />
                </div>
                <h3>Community</h3>
                <p>Building connections between car owners and renters</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <FaHandshake />
                </div>
                <h3>Trust</h3>
                <p>Creating a safe and reliable platform for all users</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <FaLeaf />
                </div>
                <h3>Sustainability</h3>
                <p>Promoting resource sharing for a greener future</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <FaShieldAlt />
                </div>
                <h3>Security</h3>
                <p>Ensuring protection for both vehicles and renters</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="about-section how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2>How AutoEase Works</h2>
            <div className="section-divider"></div>
          </div>
          <div className="process-steps">
            <div className="process-step">
              <div className="step-icon">
                <FaCar />
              </div>
              <h3>Browse Cars</h3>
              <p>Search our extensive collection of vehicles based on your location, dates, and preferences.</p>
            </div>
            <div className="process-step">
              <div className="step-icon">
                <FaHandshake />
              </div>
              <h3>Book Instantly</h3>
              <p>Reserve your car with our simple booking system. No paperwork, no hassle.</p>
            </div>
            <div className="process-step">
              <div className="step-icon">
                <FaMapMarkedAlt />
              </div>
              <h3>Pick Up & Go</h3>
              <p>Collect your car at the arranged location and enjoy your journey with confidence.</p>
            </div>
          </div>
          <div className="process-cta">
            <Link to="/cars" className="btn-primary" style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '1.2rem 2.5rem',
              fontSize: '1.2rem',
              boxShadow: '0 8px 20px rgba(0, 123, 255, 0.3)'
            }}>
              Find Your Car Now
            </Link>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-section team-section">
        <div className="container">
          <div className="section-header">
            <h2>Meet Our Team</h2>
            <div className="section-divider"></div>
          </div>
          <div className="team-members">
            <div className="team-member">
              <div className="member-image">
                <img
                  src="/images/ib.jpg"
                  alt="Ibraheem"
                  className="member-photo"
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x500?text=Ibraheem';
                  }}
                  style={{ pointerEvents: 'none' }}
                />
              </div>
              <h3>Ibraheem</h3>
              <p className="member-title">CTO</p>
              <p className="member-bio">A tech innovator with expertise in building scalable platforms and enhancing user experiences.</p>
            </div>
            <div className="team-member featured-member">
              <div className="member-image">
                <img
                  src="/images/ramis.jpg"
                  alt="Ramis Ali"
                  className="member-photo"
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x500?text=Ramis+Ali';
                  }}
                  style={{ pointerEvents: 'none' }}
                />
              </div>
              <h3>Ramis Ali</h3>
              <p className="member-title">Founder & CEO</p>
              <p className="member-bio">With over 15 years in the automotive industry, Ramis Ali brings vision and leadership to AutoEase.</p>
            </div>
            <div className="team-member">
              <div className="member-image">
                <img
                  src="/images/makki.jpg"
                  alt="Makki"
                  className="member-photo"
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x500?text=Makki';
                  }}
                  style={{ pointerEvents: 'none' }}
                />
              </div>
              <h3>Makki</h3>
              <p className="member-title">Operations Director</p>
              <p className="member-bio">Makki ensures smooth operations and exceptional service delivery across all our locations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to Experience AutoEase?</h2>
          <p>Join thousands of satisfied customers who have discovered a better way to rent cars.</p>
          <div className="cta-buttons">
            <Link to="/cars" className="btn-primary">Browse Cars</Link>
            <Link to="/become-host" className="btn-secondary">Become a Host</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
