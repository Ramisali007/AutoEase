import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../assets/HostOnboarding.css';

const HostOnboarding = () => {
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    hostBio: '',
    hostingExperience: 'Beginner',
    preferredPaymentMethod: 'Bank Transfer'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await api.post('/host/setup', formData, { headers });

      if (response.data && response.data.success) {
        // Update the current user with the new host data
        updateCurrentUser({
          ...currentUser,
          hostBio: response.data.user.hostBio,
          hostingExperience: response.data.user.hostingExperience,
          preferredPaymentMethod: response.data.user.preferredPaymentMethod,
          hostSetupComplete: true
        });

        // Navigate to the host dashboard
        navigate('/host');
      }
    } catch (err) {
      console.error('Error setting up host account:', err);
      setError(err.response?.data?.message || 'Failed to set up host account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const renderStep1 = () => (
    <div className="onboarding-step">
      <h2>Welcome to AutoEase Hosting!</h2>
      <p>
        Thank you for choosing to become a host on AutoEase. As a host, you can list your cars for rent
        and earn money when others book them. Let's get your host account set up!
      </p>
      <div className="benefits">
        <h3>Benefits of being a host:</h3>
        <ul>
          <li>Earn extra income from your vehicles when you're not using them</li>
          <li>Full control over your car's availability and who rents it</li>
          <li>Set your own pricing and rental terms that work for you</li>
          <li>Build your reputation with reviews from satisfied renters</li>
          <li>Access to host-specific analytics and insights to optimize earnings</li>
        </ul>
      </div>
      <button className="btn btn-primary" onClick={nextStep}>
        Get Started <span style={{ marginLeft: '8px' }}>→</span>
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="onboarding-step">
      <h2>Tell Us About Yourself</h2>
      <p>
        Let potential renters know a bit about you. This helps build trust and increases
        the likelihood of your cars being booked. A great profile can increase your bookings by up to 40%!
      </p>
      <div className="form-group">
        <label htmlFor="hostBio">
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>📝</span> Your Bio as a Host
          </span>
        </label>
        <textarea
          id="hostBio"
          name="hostBio"
          value={formData.hostBio}
          onChange={handleChange}
          className="form-control"
          placeholder="Example: I'm a car enthusiast with a small collection of well-maintained vehicles. I take pride in providing clean, reliable cars and excellent customer service."
          rows="5"
        ></textarea>
        <small className="form-text text-muted">
          A good bio includes your passion for cars, your commitment to maintenance, and what renters can expect from you.
        </small>
      </div>
      <div className="form-group">
        <label htmlFor="hostingExperience">
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>🏆</span> Your Experience Level
          </span>
        </label>
        <select
          id="hostingExperience"
          name="hostingExperience"
          value={formData.hostingExperience}
          onChange={handleChange}
          className="form-control"
        >
          <option value="Beginner">Beginner - I'm new to car sharing</option>
          <option value="Intermediate">Intermediate - I've rented out vehicles before</option>
          <option value="Expert">Expert - I have extensive experience in vehicle rentals</option>
        </select>
      </div>
      <div className="button-group">
        <button className="btn btn-secondary" onClick={prevStep}>
          <span style={{ marginRight: '8px' }}>←</span> Back
        </button>
        <button className="btn btn-primary" onClick={nextStep}>
          Continue <span style={{ marginLeft: '8px' }}>→</span>
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="onboarding-step">
      <h2>Payment Information</h2>
      <p>
        Choose how you'd like to receive payments from your car rentals.
        You can update this information later in your host settings.
      </p>

      <div className="payment-methods-info" style={{
        background: 'rgba(67, 97, 238, 0.03)',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '25px',
        border: '1px solid rgba(67, 97, 238, 0.1)'
      }}>
        <h4 style={{ color: 'var(--primary-dark)', marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px' }}>💰</span> Payment Processing
        </h4>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
          AutoEase processes payments securely and transfers your earnings based on your preferred method.
          Payments are typically processed within 24 hours after a completed rental.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="preferredPaymentMethod">
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '8px' }}>💳</span> Preferred Payment Method
          </span>
        </label>
        <select
          id="preferredPaymentMethod"
          name="preferredPaymentMethod"
          value={formData.preferredPaymentMethod}
          onChange={handleChange}
          className="form-control"
        >
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="PayPal">PayPal</option>
          <option value="Credit Card">Credit Card</option>
        </select>
        <small className="form-text text-muted">
          You'll be able to add specific account details after completing the setup.
        </small>
      </div>

      <div className="button-group">
        <button className="btn btn-secondary" onClick={prevStep}>
          <span style={{ marginRight: '8px' }}>←</span> Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <span>
              <span className="spinner" style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '50%',
                borderTopColor: 'white',
                animation: 'spin 1s linear infinite',
                marginRight: '10px'
              }}></span>
              Setting Up...
            </span>
          ) : (
            <span>
              Complete Setup <span style={{ marginLeft: '8px' }}>✓</span>
            </span>
          )}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );

  return (
    <div className="host-onboarding-container">
      <div className="onboarding-progress">
        <div className={`progress-step ${step >= 1 ? step > 1 ? 'completed' : 'active' : ''}`}>
          {step > 1 ? '✓' : '1'}
          <div className="progress-step-label">Welcome</div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${step >= 2 ? step > 2 ? 'completed' : 'active' : ''}`}>
          {step > 2 ? '✓' : '2'}
          <div className="progress-step-label">Profile</div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
          3
          <div className="progress-step-label">Payment</div>
        </div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default HostOnboarding;
