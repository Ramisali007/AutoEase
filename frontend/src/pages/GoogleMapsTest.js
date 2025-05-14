import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import '../assets/GoogleMapsTest.css';

// Map container style
const containerStyle = {
  width: '100%',
  height: '450px',
  borderRadius: '12px',
  border: 'none',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)'
};

// Default center (Lahore, Pakistan)
const center = {
  lat: 31.5204,
  lng: 74.3587
};

// Global variables to prevent multiple initializations
let isScriptLoaded = false;
let isScriptLoading = false;

const GoogleMapsTest = () => {
  const [map, setMap] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Get the API key from environment variables
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'Not found in .env file';

  // Custom script loader
  useEffect(() => {
    if (window.google && window.google.maps) {
      // Google Maps is already loaded
      setIsLoaded(true);
      return;
    }

    if (isScriptLoading) {
      // Script is already loading
      return;
    }

    if (isScriptLoaded) {
      // Script is loaded but Google Maps object is not available yet
      // This is an edge case
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          setIsLoaded(true);
        }
      }, 100);

      return () => clearInterval(checkGoogleMaps);
    }

    // Start loading the script
    isScriptLoading = true;

    // Create script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;

    // Setup handlers
    script.onload = () => {
      isScriptLoaded = true;
      isScriptLoading = false;
      setIsLoaded(true);
    };

    script.onerror = (error) => {
      isScriptLoading = false;
      setLoadError(new Error('Failed to load Google Maps API'));
      console.error('Error loading Google Maps API:', error);
    };

    // Append script to document
    document.head.appendChild(script);

    // Cleanup
    return () => {
      // We don't remove the script as it could be used by other components
    };
  }, [apiKey]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || loadError) return;

    try {
      // Create map instance
      const mapInstance = new window.google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 10,
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeControlOptions: {
          style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        styles: [
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }, { lightness: 17 }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 20 }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.fill",
            stylers: [{ color: "#ffffff" }, { lightness: 17 }]
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }, { lightness: 21 }]
          }
        ]
      });

      // Add a marker with custom styling
      const marker = new window.google.maps.Marker({
        position: center,
        map: mapInstance,
        title: 'Lahore, Pakistan',
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#3498db',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      // Add a simple info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: '<div style="padding: 10px; max-width: 200px;"><h3 style="margin-top: 0; color: #2c3e50;">Lahore</h3><p style="margin-bottom: 5px;">The cultural heart of Pakistan</p></div>'
      });

      // Open info window when marker is clicked
      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker);
      });

      setMap(mapInstance);
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoadError(error);
    }
  }, [isLoaded, loadError]);

  return (
    <div className="google-maps-test-page">
      <h1>Google Maps Integration</h1>
      <p>Welcome to the AutoEase Maps integration test page. This page demonstrates our Google Maps API implementation.</p>

      <div className="api-key-info">
        <h2>API Configuration</h2>
        <p><i className="fas fa-key"></i> API Key: <code>{apiKey.substring(0, 10)}...</code></p>
        <p><i className="fas fa-info-circle"></i> Status: {isLoaded ? <span style={{color: '#27ae60', fontWeight: 'bold'}}>Active</span> : <span style={{color: '#e74c3c', fontWeight: 'bold'}}>Loading...</span>}</p>
      </div>

      <div className="map-container">
        <h2>Test Map</h2>
        {loadError ? (
          <div className="map-error">
            <p>Error: {loadError.message}</p>
            <p>Please check your API key and make sure the required APIs are enabled.</p>
            <Link to="/map-debug" className="debug-link">
              Go to Maps Debugger
            </Link>
          </div>
        ) : !isLoaded ? (
          <div className="loading-container" style={containerStyle}>
            <p className="loading-text">Loading Google Maps...</p>
          </div>
        ) : (
          <div className="map-wrapper">
            <div id="map" style={containerStyle}></div>
            <div className="map-info-overlay">
              <p>Lahore, Pakistan</p>
            </div>
          </div>
        )}
      </div>

      <div className="troubleshooting">
        <h2>Maps Integration Guide</h2>
        <p>For optimal performance of the Google Maps integration, please ensure:</p>
        <ol>
          <li><strong>API Key Configuration:</strong> Verify your API key is correctly set in the <code>.env</code> file</li>
          <li><strong>API Services:</strong> Enable the Maps JavaScript API in your Google Cloud Console</li>
          <li><strong>Security Settings:</strong> Check if your API key has appropriate domain restrictions</li>
          <li><strong>Billing Setup:</strong> Confirm you have a billing account configured (required even for free tier usage)</li>
          <li><strong>Browser Compatibility:</strong> Use a modern browser with JavaScript enabled</li>
        </ol>
        <Link to="/map-debug" className="debug-link">
          <i className="fas fa-tools"></i> Advanced Diagnostics
        </Link>
      </div>
    </div>
  );
};

export default GoogleMapsTest;
