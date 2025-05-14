import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Link } from 'react-router-dom';
import './CarsMap.css';

const containerStyle = {
  width: '100%',
  height: '500px'
};

const defaultCenter = {
  lat: 31.5204, // Default to Lahore, Pakistan
  lng: 74.3587
};

const libraries = ['places'];

const CarsMap = ({ cars }) => {
  const { isLoaded, loadError: initialLoadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [map, setMap] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [loadError, setLoadError] = useState(initialLoadError);

  // Initialize the map
  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  // Clean up the map
  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Filter cars that have location data
  const carsWithLocation = cars.filter(car =>
    car.location &&
    car.location.coordinates &&
    car.location.coordinates.coordinates &&
    car.location.coordinates.coordinates.length === 2
  );

  // Calculate bounds to fit all markers - memoized to avoid dependency issues
  const getBounds = useCallback(() => {
    if (!map || carsWithLocation.length === 0) return null;

    const bounds = new window.google.maps.LatLngBounds();

    carsWithLocation.forEach(car => {
      bounds.extend({
        lat: car.location.coordinates.coordinates[1],
        lng: car.location.coordinates.coordinates[0]
      });
    });

    return bounds;
  }, [map, carsWithLocation]);

  // Effect for fitting map to bounds when map and cars are loaded
  useEffect(() => {
    if (map && carsWithLocation.length > 0) {
      const bounds = getBounds();
      if (bounds) {
        map.fitBounds(bounds);
      }
    }
  }, [map, carsWithLocation, getBounds]);

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

    // If no cars have location data
    if (carsWithLocation.length === 0) {
      return (
        <div className="no-cars-map">
          <p>No cars with location data available.</p>
        </div>
      );
    }

    // If Google Maps is still loading
    if (!isLoaded) {
      return <div className="map-loading">Loading Google Maps...</div>;
    }

    // If everything is loaded correctly, show the map
    return (
      <div className="cars-map-container">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          {carsWithLocation.map(car => (
            <Marker
              key={car._id}
              position={{
                lat: car.location.coordinates.coordinates[1],
                lng: car.location.coordinates.coordinates[0]
              }}
              onClick={() => setSelectedCar(car)}
              icon={{
                url: car.isAvailable
                  ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                  : 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                scaledSize: new window.google.maps.Size(40, 40)
              }}
            />
          ))}

          {selectedCar && (
            <InfoWindow
              position={{
                lat: selectedCar.location.coordinates.coordinates[1],
                lng: selectedCar.location.coordinates.coordinates[0]
              }}
              onCloseClick={() => setSelectedCar(null)}
            >
              <div className="car-info-window">
                <h3>{selectedCar.brand} {selectedCar.model}</h3>
                <p className="car-year">{selectedCar.year}</p>
                <p className="car-price">${selectedCar.pricePerDay}/day</p>
                <p className={`car-status ${selectedCar.isAvailable ? 'available' : 'booked'}`}>
                  {selectedCar.isAvailable ? 'Available' : 'Booked'}
                </p>
                <Link to={`/cars/${selectedCar._id}`} className="view-car-btn">
                  View Details
                </Link>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    );
  };

  return renderContent();
};

export default CarsMap;
