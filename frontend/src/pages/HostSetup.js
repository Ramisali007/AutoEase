import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HostOnboarding from '../components/HostOnboarding';

const HostSetup = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!loading && !currentUser) {
      navigate('/login');
      return;
    }

    // If user is logged in but not a host, redirect to home
    if (!loading && currentUser && currentUser.role !== 'host') {
      navigate('/');
      return;
    }

    // If user is a host, always redirect to host dashboard
    // This ensures existing hosts don't see the setup page again
    if (!loading && currentUser && currentUser.role === 'host') {
      console.log('Host user detected, redirecting to host dashboard');
      navigate('/host');
      return;
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="host-setup-page">
      <HostOnboarding />
    </div>
  );
};

export default HostSetup;
