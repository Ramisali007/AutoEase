import React, { useState } from 'react';
import GoogleMapsDebugger from '../components/GoogleMapsDebugger';
import { Link } from 'react-router-dom';
import { FaMapMarkedAlt, FaCarSide } from 'react-icons/fa';
import '../assets/MapDebug.css';

const MapDebug = () => {
  const [apiKey, setApiKey] = useState('');
  const [testUrl, setTestUrl] = useState('');

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const generateTestUrl = () => {
    if (!apiKey) {
      alert('Please enter an API key to test');
      return;
    }

    const url = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    setTestUrl(url);
    window.open(url, '_blank');
  };

  return (
    <div className="map-debug-page">
      <h1>Google Maps API Debugger</h1>
      <p>This page helps diagnose issues with the Google Maps API integration.</p>

      <div className="api-key-tester">
        <h2>Test Your API Key</h2>
        <p>Enter your Google Maps API key to test it directly:</p>
        <div className="api-key-input-group">
          <input
            type="text"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your Google Maps API key"
            className="api-key-input"
          />
          <button onClick={generateTestUrl} className="test-api-button">
            Test API Key
          </button>
        </div>
        {testUrl && (
          <div className="test-url-result">
            <p>Test URL (opened in new tab):</p>
            <code className="test-url">{testUrl}</code>
          </div>
        )}
        <p className="test-note">
          If you see a JavaScript error in the new tab, your API key is invalid or restricted.
          If you see a blank page with no errors, your API key is working correctly.
        </p>
      </div>

      <div className="quick-links">
        <h2>Quick Links</h2>
        <div className="quick-links-grid">
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="quick-link-card"
          >
            <h3>API Key Management</h3>
            <p>View and manage your API keys</p>
          </a>
          <a
            href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="quick-link-card"
          >
            <h3>Enable Maps JavaScript API</h3>
            <p>Required for map display</p>
          </a>
          <a
            href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="quick-link-card"
          >
            <h3>Enable Places API</h3>
            <p>Required for location search</p>
          </a>
          <a
            href="https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="quick-link-card"
          >
            <h3>Enable Geocoding API</h3>
            <p>Required for address lookup</p>
          </a>
        </div>
      </div>

      <div className="navigation-links">
        <Link
          to="/google-maps-test"
          className="nav-link high-contrast-nav-link"
        >
          <FaMapMarkedAlt style={{ marginRight: '8px' }} />
          Go to Simple Maps Test
        </Link>
        <Link
          to="/cars"
          className="nav-link high-contrast-nav-link"
        >
          <FaCarSide style={{ marginRight: '8px' }} />
          Return to Cars Page
        </Link>
      </div>

      <GoogleMapsDebugger />

      <div className="debug-instructions">
        <h2>Common Issues and Solutions</h2>

        <div className="issue-card">
          <h3>1. API Key Issues</h3>
          <p>If you see "This page can't load Google Maps correctly", your API key might have issues:</p>
          <ul>
            <li>Make sure your API key is correct in the .env file</li>
            <li>Check if your API key has domain restrictions that prevent it from working on localhost</li>
            <li>Verify that billing is enabled for your Google Cloud project</li>
          </ul>
        </div>

        <div className="issue-card">
          <h3>2. Missing API Activation</h3>
          <p>You need to enable these APIs in Google Cloud Console:</p>
          <ul>
            <li>Maps JavaScript API</li>
            <li>Geocoding API</li>
            <li>Places API (if using autocomplete)</li>
          </ul>
          <a
            href="https://console.cloud.google.com/apis/library"
            target="_blank"
            rel="noopener noreferrer"
            className="debug-link"
          >
            Go to Google Cloud Console API Library
          </a>
        </div>

        <div className="issue-card">
          <h3>3. Billing Account</h3>
          <p>Google Maps Platform requires a billing account, even for the free tier:</p>
          <ul>
            <li>Set up a billing account in Google Cloud Console</li>
            <li>You get $200 monthly credit which is enough for most small applications</li>
            <li>You can set budget alerts to avoid unexpected charges</li>
          </ul>
          <a
            href="https://console.cloud.google.com/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="debug-link"
          >
            Go to Google Cloud Console Billing
          </a>
        </div>

        <div className="issue-card">
          <h3>4. API Key Restrictions</h3>
          <p>If you've restricted your API key, make sure to include:</p>
          <ul>
            <li>Your development domain (localhost:3000) in the allowed referrers</li>
            <li>Your production domain in the allowed referrers</li>
            <li>Only restrict to the APIs you're using (Maps JavaScript, Geocoding, Places)</li>
          </ul>
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="debug-link"
          >
            Go to Google Cloud Console Credentials
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapDebug;
