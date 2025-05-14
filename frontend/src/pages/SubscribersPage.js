import React from 'react';
import SubscribersList from '../components/SubscribersList';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import '../assets/AdminDashboard.css';

const SubscribersPage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // If still loading auth state, show loading
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If not admin, redirect to home
  if (currentUser.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return (
    <>
      {/* Simple admin navbar */}
      <div className="admin-navbar" style={{
        backgroundColor: '#000',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img
            src="/images/logoo.png"
            alt="AutoEase Logo"
            style={{ height: '60px', width: 'auto' }}
          />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => navigate('/admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#4361ee',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'white',
            fontWeight: '600'
          }}>
            <FontAwesomeIcon icon={faUser} />
            <span>{currentUser.name}</span>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-container">
        <div className="admin-header">
          <div className="admin-header-content">
            <div>
              <h1>Newsletter Subscribers</h1>
              <p>Manage your newsletter subscribers</p>
            </div>
          </div>
        </div>

        <SubscribersList />
      </div>
    </>
  );
};

export default SubscribersPage;
