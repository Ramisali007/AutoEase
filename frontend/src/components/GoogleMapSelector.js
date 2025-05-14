import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import './GoogleMapSelector.css';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 31.5204, // Default to Lahore, Pakistan
  lng: 74.3587
};

// Include both places and geocoding libraries
const libraries = ['places', 'geocoding'];

const GoogleMapSelector = ({
  initialLocation,
  onLocationSelect,
  showSearchBox = true,
  readOnly = false
}) => {
  // Load the Google Maps API
  const { isLoaded, loadError: initialLoadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(initialLocation || defaultCenter);
  const [searchBox, setSearchBox] = useState(null);
  const [address, setAddress] = useState('');
  const [loadError, setLoadError] = useState(initialLoadError);

  // Initialize the map
  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  // Clean up the map
  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Handle map click to set marker
  const handleMapClick = (event) => {
    if (readOnly || !isLoaded) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setMarker({ lat, lng });

    // Get address from coordinates (reverse geocoding)
    try {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setAddress(results[0].formatted_address);

            // Pass location data to parent component
            onLocationSelect({
              address: results[0].formatted_address,
              coordinates: {
                type: 'Point',
                coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
              }
            });
          } else {
            console.warn('Geocoding failed with status:', status);
            // Still pass coordinates even if geocoding fails
            onLocationSelect({
              address: 'Location selected on map',
              coordinates: {
                type: 'Point',
                coordinates: [lng, lat]
              }
            });
          }
        });
      } else {
        console.warn('Google Maps Geocoder not available');
        // Still pass coordinates even if geocoder is not available
        onLocationSelect({
          address: 'Location selected on map',
          coordinates: {
            type: 'Point',
            coordinates: [lng, lat]
          }
        });
      }
    } catch (error) {
      console.error('Error using Geocoder:', error);
      // Still pass coordinates even if there's an error
      onLocationSelect({
        address: 'Location selected on map',
        coordinates: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });
    }
  };

  // Initialize with initial location if provided
  useEffect(() => {
    if (!isLoaded || !initialLocation) return;

    try {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({
          location: {
            lat: initialLocation.lat,
            lng: initialLocation.lng
          }
        }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setAddress(results[0].formatted_address);
          } else {
            console.warn('Geocoding failed with status:', status);
          }
        });
      } else {
        console.warn('Google Maps Geocoder not available for initial location');
      }
    } catch (error) {
      console.error('Error using Geocoder for initial location:', error);
    }
  }, [initialLocation, isLoaded]);

  // Add a global error handler for Google Maps authentication failures
  useEffect(() => {
    // Update loadError state if initialLoadError changes
    if (initialLoadError) {
      setLoadError(initialLoadError);
    }

    window.gm_authFailure = () => {
      console.error("Google Maps Authentication Failed");
      setLoadError({
        message: "Google Maps authentication failed. Your API key may be invalid or restricted."
      });
    };

    return () => {
      // Clean up the global error handler when component unmounts
      window.gm_authFailure = null;
    };
  }, [initialLoadError]);

  // Initialize search box
  const onSearchBoxLoad = (ref) => {
    setSearchBox(ref);
  };

  // Handle place selection from search box
  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setMarker({ lat, lng });
        setAddress(place.formatted_address);

        // Center the map on the selected place
        if (map) {
          map.panTo({ lat, lng });
        }

        // Pass location data to parent component
        onLocationSelect({
          address: place.formatted_address,
          coordinates: {
            type: 'Point',
            coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
          }
        });
      }
    }
  };

  // Handle search input
  const handleAddressSearch = () => {
    if (!isLoaded || !address) return;

    try {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();

            setMarker({ lat, lng });

            // Center the map on the selected place
            if (map) {
              map.panTo({ lat, lng });
            }

            // Pass location data to parent component
            onLocationSelect({
              address: results[0].formatted_address,
              coordinates: {
                type: 'Point',
                coordinates: [lng, lat] // GeoJSON format: [longitude, latitude]
              }
            });
          } else {
            console.warn('Geocoding search failed with status:', status);
          }
        });
      } else {
        console.warn('Google Maps Geocoder not available for address search');
      }
    } catch (error) {
      console.error('Error using Geocoder for address search:', error);
    }
  };

  // Render function to handle different states
  const renderContent = () => {
    // If there's an error loading Google Maps
    if (loadError) {
      console.error("Google Maps Error:", loadError);
      return (
        <div className="map-error">
          <p>Error loading Google Maps</p>
          <p className="error-details">
            {loadError.message || "Please check your API key and make sure Maps JavaScript API is enabled."}
          </p>
          <p className="error-help">
            If you're seeing "This page can't load Google Maps correctly", please make sure:
            <ul>
              <li>Your API key is correct</li>
              <li>Maps JavaScript API is enabled in Google Cloud Console</li>
              <li>Your API key doesn't have domain restrictions that block this site</li>
              <li>You have a billing account set up (even for free tier)</li>
            </ul>
          </p>
          <div className="map-error-actions">
            <Link to="/map-debug" className="map-debug-link">
              Go to Maps Debugger
            </Link>
          </div>
        </div>
      );
    }

    // If Google Maps is still loading
    if (!isLoaded) {
      return <div className="map-loading">Loading Google Maps...</div>;
    }

    // If everything is loaded correctly, show the map
    return (
      <div className="google-map-selector">
        {showSearchBox && !readOnly && (
          <div className="search-box">
            <input
              type="text"
              placeholder="Search for a location"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="search-input"
            />
            <button onClick={handleAddressSearch} className="search-button">
              Search
            </button>
          </div>
        )}

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={marker}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          <Marker position={marker} />
        </GoogleMap>

        {address && (
          <div className="selected-address">
            <strong>Selected Location:</strong> {address}
          </div>
        )}
      </div>
    );
  };

  return renderContent();
};

export default GoogleMapSelector;
