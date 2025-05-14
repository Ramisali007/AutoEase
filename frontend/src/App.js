import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TestReset from './pages/TestReset';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import HostDashboard from './pages/HostDashboard';
import HostSetup from './pages/HostSetup';
import CarListing from './pages/CarListing';
import CarDetail from './pages/CarDetail';
import BookingConfirmation from './pages/BookingConfirmation';
import BookingSuccess from './pages/BookingSuccess';
import Reviews from './pages/Reviews';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import BecomeHost from './pages/BecomeHost';
import FAQ from './pages/FAQ';
import About from './pages/About';
import Contact from './pages/Contact';
import SubscribersPage from './pages/SubscribersPage';
import Settings from './pages/Settings';
import Features from './pages/Features';
import MapDebug from './pages/MapDebug';
import GoogleMapsTest from './pages/GoogleMapsTest';
import QuickActionDemo from './components/QuickActionDemo';

// CSS
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Admin protected route component
const AdminProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/" state={{ message: "You don't have permission to access this page" }} />;
  }

  return children;
};



// Host protected route component
const HostProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (currentUser.role !== 'host' && currentUser.role !== 'admin') {
    return <Navigate to="/" state={{ message: "You don't have permission to access this page" }} />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Admin subscribers page without Layout */}
        <Route
          path="/admin/subscribers"
          element={
            <ProtectedRoute>
              <SubscribersPage />
            </ProtectedRoute>
          }
        />

        {/* All other routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          {/* Test route for reset password */}
          <Route path="/test-reset" element={<TestReset />} />
          {/* Add a catch-all route for debugging */}
          <Route path="*" element={<div>Route not found. Please check the URL.</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/host"
            element={
              <HostProtectedRoute>
                <HostDashboard />
              </HostProtectedRoute>
            }
          />
          <Route
            path="/host-setup"
            element={
              <ProtectedRoute>
                <HostSetup />
              </ProtectedRoute>
            }
          />
          <Route path="/cars" element={<CarListing />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route
            path="/booking/confirm"
            element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/success"
            element={
              <ProtectedRoute>
                <BookingSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logout"
            element={
              <ProtectedRoute>
                <Logout />
              </ProtectedRoute>
            }
          />
          <Route path="/become-host" element={<BecomeHost />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/features" element={<Features />} />
          <Route
            path="/map-debug"
            element={
              <AdminProtectedRoute>
                <MapDebug />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/google-maps-test"
            element={
              <AdminProtectedRoute>
                <GoogleMapsTest />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quick-action-demo"
            element={
              <AdminProtectedRoute>
                <QuickActionDemo />
              </AdminProtectedRoute>
            }
          />
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  // Use the Google Client ID from environment variables
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  console.log('Google Client ID:', googleClientId);

  if (!googleClientId) {
    console.error('Google Client ID is not defined in environment variables');
  }

  return (
    <GoogleOAuthProvider
      clientId={googleClientId}
      onScriptLoadError={() => console.error('Google OAuth script failed to load')}
      onScriptLoadSuccess={() => console.log('Google OAuth script loaded successfully')}
      redirectUri={window.location.origin}
    >
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <ChatProvider>
              <AppContent />
            </ChatProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
