import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCar, 
  FaMapMarkedAlt, 
  FaMobileAlt, 
  FaShieldAlt, 
  FaUserFriends, 
  FaCreditCard,
  FaCheck,
  FaArrowRight
} from 'react-icons/fa';
import '../assets/Features.css';

const Features = () => {
  const features = [
    {
      id: 1,
      icon: <FaCar />,
      title: 'Wide Vehicle Selection',
      description: 'Choose from our extensive fleet of vehicles to suit your needs and budget.',
      benefits: [
        'Luxury, economy, and specialty vehicles',
        'Latest models with advanced features',
        'Well-maintained and regularly serviced',
        'Options for every occasion and group size'
      ],
      linkText: 'Browse Cars',
      linkUrl: '/cars'
    },
    {
      id: 2,
      icon: <FaMapMarkedAlt />,
      title: 'Flexible Pickup & Return',
      description: 'Convenient pickup and return locations with flexible scheduling options.',
      benefits: [
        'Multiple pickup locations across the city',
        'Airport pickup and drop-off available',
        'Flexible timing to suit your schedule',
        '24/7 service at select locations'
      ],
      linkText: 'View Locations',
      linkUrl: '/locations'
    },
    {
      id: 3,
      icon: <FaMobileAlt />,
      title: 'Mobile App Experience',
      description: 'Manage your rentals on the go with our intuitive mobile application.',
      benefits: [
        'Book and manage reservations',
        'Digital key for select vehicles',
        'Real-time notifications and updates',
        'GPS navigation and trip planning'
      ],
      linkText: 'Download App',
      linkUrl: '/download'
    },
    {
      id: 4,
      icon: <FaShieldAlt />,
      title: 'Comprehensive Insurance',
      description: 'Drive with peace of mind with our comprehensive insurance coverage options.',
      benefits: [
        'Collision Damage Waiver (CDW)',
        'Theft Protection (TP)',
        'Personal Accident Insurance (PAI)',
        'Third-party liability coverage'
      ],
      linkText: 'Insurance Details',
      linkUrl: '/insurance'
    },
    {
      id: 5,
      icon: <FaUserFriends />,
      title: 'Membership Benefits',
      description: 'Join our membership program for exclusive benefits and rewards.',
      benefits: [
        'Priority booking and upgrades',
        'Earn points on every rental',
        'Exclusive member-only discounts',
        'Expedited pickup and return process'
      ],
      linkText: 'Join Now',
      linkUrl: '/membership'
    },
    {
      id: 6,
      icon: <FaCreditCard />,
      title: 'Flexible Payment Options',
      description: 'Multiple payment methods and flexible billing options for your convenience.',
      benefits: [
        'Credit/debit cards accepted',
        'Digital wallet integration',
        'Split payment options',
        'Corporate billing solutions'
      ],
      linkText: 'Payment Info',
      linkUrl: '/payment-info'
    }
  ];

  return (
    <div className="features-container">
      <div className="features-header">
        <h1>AutoEase Premium Features</h1>
        <p>
          Discover the premium features that make AutoEase the best choice for your car rental needs.
          We're committed to providing a seamless, convenient, and enjoyable experience from booking to return.
        </p>
      </div>
      
      <div className="features-grid">
        {features.map((feature) => (
          <div className="feature-card" key={feature.id}>
            <div className="feature-card-header">
              <div className="feature-icon">{feature.icon}</div>
              <h2 className="feature-card-title">{feature.title}</h2>
            </div>
            
            <div className="feature-card-body">
              <p className="feature-card-description">{feature.description}</p>
              
              <ul className="feature-card-list">
                {feature.benefits.map((benefit, index) => (
                  <li className="feature-card-list-item" key={index}>
                    <FaCheck className="feature-card-list-icon" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="feature-card-footer">
              <Link to={feature.linkUrl} className="feature-card-btn">
                {feature.linkText} <FaArrowRight style={{ marginLeft: '0.5rem' }} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="features-cta" style={{ 
        textAlign: 'center', 
        marginTop: '4rem', 
        padding: '3rem', 
        backgroundColor: 'white', 
        borderRadius: '16px',
        boxShadow: 'var(--card-shadow)',
        background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.05), rgba(76, 201, 240, 0.05))'
      }}>
        <h2 style={{ 
          fontSize: '2rem', 
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Ready to Experience AutoEase?
        </h2>
        <p style={{ 
          fontSize: '1.2rem', 
          color: 'var(--text-secondary)', 
          maxWidth: '700px', 
          margin: '0 auto 2rem',
          lineHeight: '1.6'
        }}>
          Join thousands of satisfied customers who choose AutoEase for their car rental needs.
          Sign up today and enjoy all these premium features on your next trip.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/register" style={{
            padding: '1rem 2rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            borderRadius: '8px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all var(--transition-speed) ease',
            display: 'inline-block'
          }}>
            Sign Up Now
          </Link>
          <Link to="/cars" style={{
            padding: '1rem 2rem',
            backgroundColor: 'white',
            color: 'var(--primary-color)',
            borderRadius: '8px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all var(--transition-speed) ease',
            display: 'inline-block',
            border: '2px solid var(--primary-color)'
          }}>
            Browse Cars
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Features;
