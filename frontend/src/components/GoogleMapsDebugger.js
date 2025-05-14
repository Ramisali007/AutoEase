import React, { useState, useEffect, useCallback } from 'react';
import './GoogleMapSelector.css';

const GoogleMapsDebugger = () => {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enabledAPIs, setEnabledAPIs] = useState([]);
  const [domainRestrictions, setDomainRestrictions] = useState('Unknown');

  // Function to check which Google Maps APIs are enabled - using useCallback to avoid dependency issues
  const checkEnabledAPIs = useCallback(() => {
    const enabled = [];

    // Check if Maps JavaScript API is enabled
    if (window.google && window.google.maps) {
      enabled.push('Maps JavaScript API');
    }

    // Check if Geocoding API is enabled
    if (window.google && window.google.maps && window.google.maps.Geocoder) {
      enabled.push('Geocoding API');
    }

    // Check if Places API is enabled
    if (window.google && window.google.maps && window.google.maps.places) {
      enabled.push('Places API');
    }

    setEnabledAPIs(enabled);

    // Try to determine if there are domain restrictions
    if (window.google && window.google.maps) {
      setDomainRestrictions('No restrictions detected');
    } else {
      setDomainRestrictions('Possible domain restrictions');
    }
  }, []);

  // Function to initialize the test map - using useCallback to avoid dependency issues
  const initializeTestMap = useCallback(() => {
    if (window.google && window.google.maps) {
      try {
        const mapElement = document.getElementById('test-map');
        if (mapElement) {
          const map = new window.google.maps.Map(mapElement, {
            center: { lat: 31.5204, lng: 74.3587 }, // Lahore, Pakistan
            zoom: 10,
          });

          // Add a marker to the map
          new window.google.maps.Marker({
            position: { lat: 31.5204, lng: 74.3587 },
            map: map,
            title: 'Lahore, Pakistan'
          });

          // Update status if map loads successfully
          setStatus('Google Maps API loaded and test map initialized successfully');
        }
      } catch (err) {
        console.error('Error initializing test map:', err);
        setError(`Error initializing test map: ${err.message}`);
      }
    }
  }, []);

  useEffect(() => {
    // Get the API key from environment variables
    const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    setApiKey(key || 'Not found in .env file');

    // Set up error handler for Google Maps authentication failures
    window.gm_authFailure = () => {
      setStatus('Google Maps authentication failed');
      setError('Your API key may be invalid or restricted');
      setIsLoading(false);
    };

    // Check if the Google Maps API is loaded
    if (window.google && window.google.maps) {
      setStatus('Google Maps API is loaded');
      setIsLoading(false);

      // If Google Maps is already loaded, check which APIs are available
      checkEnabledAPIs();

      // Initialize test map
      setTimeout(initializeTestMap, 0);
    } else {
      // Try to load the API manually to check for errors
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;

      // Define the callback function
      window.initMap = () => {
        setStatus('Google Maps API loaded successfully');
        setIsLoading(false);
        checkEnabledAPIs();

        // Initialize test map
        initializeTestMap();
      };

      // Handle errors
      script.onerror = () => {
        setStatus('Failed to load Google Maps API');
        setError('Check the console for more details');
        setIsLoading(false);
      };

      document.head.appendChild(script);
    }

    // Clean up function
    return () => {
      // Remove the global callback if it exists
      if (window.initMap) {
        window.initMap = undefined;
      }
      if (window.gm_authFailure) {
        window.gm_authFailure = undefined;
      }
    };
  }, [checkEnabledAPIs, initializeTestMap]);

  return (
    <div className="google-maps-debugger">
      <h2>Google Maps API Debugger</h2>

      <div className="debug-section">
        <h3>API Key</h3>
        <p>
          {apiKey.substring(0, 10)}...
          <button
            onClick={() => navigator.clipboard.writeText(apiKey)}
            className="copy-button"
          >
            Copy Full Key
          </button>
        </p>
        <p className="api-key-note">
          Current key: <code>{apiKey}</code>
        </p>
      </div>

      <div className="debug-section">
        <h3>Status</h3>
        <p className={error ? 'error-status' : 'success-status'}>
          {isLoading ? 'Checking...' : status}
        </p>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="debug-section">
        <h3>Enabled APIs</h3>
        {enabledAPIs.length > 0 ? (
          <ul className="enabled-apis-list">
            {enabledAPIs.map((api, index) => (
              <li key={index} className="enabled-api">
                ✅ {api}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-apis">No APIs detected as enabled</p>
        )}
      </div>

      <div className="debug-section">
        <h3>Domain Restrictions</h3>
        <p>{domainRestrictions}</p>
        <p className="current-domain">
          Current domain: <code>{window.location.origin}</code>
        </p>
      </div>

      <div className="debug-section">
        <h3>Test Map</h3>
        <div
          id="test-map"
          style={{
            height: '250px',
            width: '100%',
            border: '2px solid var(--neutral-light)',
            borderRadius: '10px',
            marginTop: '15px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}
        >
          {isLoading ? 'Loading map...' : 'Map should appear here if API key is working'}
        </div>
        <p className="test-map-note">
          If you see "This page can't load Google Maps correctly" above, your API key has issues.
        </p>
      </div>

      <div className="debug-section">
        <h3>Troubleshooting Steps</h3>
        <ol>
          <li>
            <strong>Check API Key:</strong> Make sure your API key is correct and not restricted to specific domains
          </li>
          <li>
            <strong>Enable APIs:</strong> Enable the following APIs in Google Cloud Console:
            <ul>
              <li>
                <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" rel="noopener noreferrer">
                  Maps JavaScript API
                </a>
              </li>
              <li>
                <a href="https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com" target="_blank" rel="noopener noreferrer">
                  Geocoding API
                </a>
              </li>
              <li>
                <a href="https://console.cloud.google.com/apis/library/places-backend.googleapis.com" target="_blank" rel="noopener noreferrer">
                  Places API
                </a>
              </li>
            </ul>
          </li>
          <li>
            <strong>Billing:</strong> Ensure you have a billing account set up (even for the free tier)
          </li>
          <li>
            <strong>API Restrictions:</strong> If you've set domain restrictions, make sure your development domain is included
          </li>
          <li>
            <strong>Update .env File:</strong> Make sure your <code>.env</code> file has the correct API key:
            <pre>REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here</pre>
          </li>
          <li>
            <strong>Restart Development Server:</strong> After updating the .env file, restart your development server
          </li>
        </ol>
      </div>
    </div>
  );
};

export default GoogleMapsDebugger;
