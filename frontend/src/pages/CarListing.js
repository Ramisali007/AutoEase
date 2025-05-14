import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getCarFallbackImage } from '../utils/imageFallbacks';
import { getLocalCarFallbackImage } from '../utils/localImageFallbacks';
import CarsMap from '../components/CarsMap';
import SearchBar from '../components/SearchBar';
import QuickActionModal from '../components/QuickActionModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faGasPump,
  faCar,
  faUsers,
  faTachometerAlt
} from '@fortawesome/free-solid-svg-icons';
import '../assets/CarListing.css';

// Define filter options directly in the component
const carTypes = [
  'Sedan',
  'SUV',
  'Electric',
  'Sports',
  'Luxury',
  'Compact',
  'Convertible',
  'Van'
];

const carBrands = [
  'Toyota',
  'Honda',
  'Tesla',
  'Ford',
  'Jeep',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Chevrolet',
  'Nissan'
];

const fuelTypes = [
  'Gasoline',
  'Petrol',
  'Diesel',
  'Electric',
  'Hybrid',
  'Plug-in Hybrid'
];

const CarListing = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    brand: '',
    fuelType: '',
    priceRange: '',
    availability: false // Show all cars by default
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Quick preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        console.log('Fetching cars...');

        // Fetch cars from API
        console.log('Making API request to:', 'http://localhost:5000/api/cars');

        // Try with axios
        const response = await api.get('/cars');
        console.log('API Response:', response);

        // Try with direct fetch as a fallback
        try {
          console.log('Trying direct fetch as fallback...');
          const directFetch = await fetch('http://localhost:5000/api/cars');
          const directData = await directFetch.json();
          console.log('Direct fetch response:', directData);
        } catch (fetchErr) {
          console.error('Direct fetch failed:', fetchErr);
        }

        let carsData = [];

        if (response.data && response.data.data) {
          console.log('Cars data:', response.data.data);
          carsData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          // Handle case where API returns array directly
          console.log('Cars data (array):', response.data);
          carsData = response.data;
        } else {
          console.error('Invalid data format:', response.data);
          setError('Invalid data format received from server');
          setLoading(false);
          return;
        }

        // Log car images and host details for debugging
        carsData.forEach((car, index) => {
          console.log(`Car ${index + 1} details:`, {
            id: car._id,
            brand: car.brand,
            model: car.model,
            owner: car.owner ? {
              id: car.owner._id,
              name: car.owner.name,
              role: car.owner.role,
              profileImage: car.owner.profileImage
            } : 'No owner data',
            hostDetails: car.hostDetails ? {
              name: car.hostDetails.name,
              isAdmin: car.hostDetails.isAdmin,
              profileImage: car.hostDetails.profileImage
            } : 'No host details'
          });

          if (car.images && car.images.length > 0) {
            console.log(`Car ${index + 1} (${car.brand} ${car.model}) has ${car.images.length} images:`, car.images);
          } else {
            console.warn(`Car ${index + 1} (${car.brand} ${car.model}) has no images`);
          }
        });

        setCars(carsData);
      } catch (err) {
        setError('Failed to fetch cars: ' + (err.response?.data?.message || err.message));
        console.error('Error fetching cars:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle search term change
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const filteredCars = cars.filter(car => {
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const brandMatch = (car.brand || '').toLowerCase().includes(searchLower);
      const modelMatch = (car.model || '').toLowerCase().includes(searchLower);
      const typeMatch = (car.type || '').toLowerCase().includes(searchLower);
      const yearMatch = (car.year || '').toString().includes(searchLower);

      // If no match on any searchable field, exclude this car
      if (!(brandMatch || modelMatch || typeMatch || yearMatch)) {
        return false;
      }
    }

    // Filter by car type
    if (filters.type && car.type !== filters.type) {
      return false;
    }

    // Filter by brand
    if (filters.brand && car.brand !== filters.brand) {
      return false;
    }

    // Filter by fuel type
    if (filters.fuelType && car.fuelType !== filters.fuelType && car.fuel_type !== filters.fuelType) {
      return false;
    }

    // Filter by price range
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      const price = car.pricePerDay || car.price || 0;
      if (price < min || (max && price > max)) {
        return false;
      }
    }

    // Filter by availability
    if (filters.availability) {
      // Check both availability and isAvailable properties
      const isAvailable = car.availability !== false && car.isAvailable !== false;
      if (!isAvailable) {
        return false;
      }
    }

    return true;
  });

  if (loading) {
    return <div className="loading">Loading cars...</div>;
  }

  return (
    <>
      <div className="car-listing-container">
        <div className="car-listing-header">
          <h1>Available Cars</h1>
          <p>Choose from our wide selection of quality vehicles</p>

          <div className="search-and-view-controls">
            <SearchBar
              placeholder="Search by brand, model, type..."
              onSearch={handleSearch}
              className="car-search-bar"
            />

            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <i className="fa fa-list"></i> List View
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                <i className="fa fa-map"></i> Map View
              </button>
            </div>
          </div>
        </div>

      <div className="car-listing-content">
        <div className="filters-section">
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Car Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Types</option>
              {carTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Brand</label>
            <select
              name="brand"
              value={filters.brand}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Brands</option>
              {carBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Fuel Type</label>
            <select
              name="fuelType"
              value={filters.fuelType}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Fuel Types</option>
              {fuelTypes.map(fuelType => (
                <option key={fuelType} value={fuelType}>{fuelType}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <select
              name="priceRange"
              value={filters.priceRange}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Prices</option>
              <option value="0-50">$0 - $50 per day</option>
              <option value="51-75">$51 - $75 per day</option>
              <option value="76-100">$76 - $100 per day</option>
              <option value="101-150">$101 - $150 per day</option>
              <option value="151-1000">$151+ per day</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="availability"
                checked={filters.availability}
                onChange={handleFilterChange}
              />
              Show only available cars
            </label>
          </div>

          <button
            className="clear-filters-button"
            onClick={() => {
              setFilters({
                type: '',
                brand: '',
                fuelType: '',
                priceRange: '',
                availability: false // Show all cars when filters are cleared
              });
              setSearchTerm(''); // Also clear the search term
            }}
          >
            Clear All Filters
          </button>
        </div>

        <div className={`cars-${viewMode === 'list' ? 'grid' : 'map-view'}`}>
          {error && <div className="alert alert-danger">{error}</div>}

          {filteredCars.length === 0 ? (
            <p>No cars found matching your criteria.</p>
          ) : viewMode === 'map' ? (
            <CarsMap cars={filteredCars} />
          ) : (
            filteredCars.map((car) => (
              <div key={car._id} className="car-card">
                <div className="car-image">
                  <img
                    src={car.images && car.images.length > 0 ? car.images[0] : getLocalCarFallbackImage(car)}
                    alt={`${car.brand || 'Car'} ${car.model || ''}`}
                    onClick={(e) => e.stopPropagation()}
                    onError={(e) => {
                      console.log(`Car image failed to load for ${car.brand || 'Unknown'} ${car.model || ''}, trying fallback`);
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = getLocalCarFallbackImage(car);
                    }}
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
                <div className="car-details">
                  <h3>{car.brand || 'Unknown'} {car.model || ''}</h3>
                  <div className="car-info">
                    <span className="car-year">{car.year || 'N/A'}</span>
                    <span className="car-type">{car.transmission || 'N/A'}</span>
                    <span className="car-fuel">{car.fuelType || car.fuel_type || 'N/A'}</span>
                    <span className="car-seats">{car.seatingCapacity ? `${car.seatingCapacity} seats` : ''}</span>
                  </div>
                  <div className="car-price">${car.pricePerDay || car.price || 0} <span>per day</span></div>
                  <div className="car-rating">
                    <span className="stars">{'★'.repeat(Math.floor(car.averageRating || 0))}{'☆'.repeat(5 - Math.floor(car.averageRating || 0))}</span>
                    <span className="rating-value">{car.averageRating ? car.averageRating.toFixed(1) : 'New'}</span>
                    <span className="review-count">({car.reviewCount || 0} reviews)</span>
                  </div>
                  <div className={`car-host ${car.hostDetails?.isAdmin ? 'admin-host-container' : ''}`}>
                    <div className="host-avatar-small">
                      <img
                        src={car.hostDetails?.profileImage || (car.hostDetails?.isAdmin ? 'https://via.placeholder.com/30?text=Admin' : 'https://via.placeholder.com/30?text=Host')}
                        alt={`${car.hostDetails?.isAdmin ? 'Admin' : 'Host'} ${car.hostDetails?.name || 'Unknown'}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = car.hostDetails?.isAdmin
                            ? 'https://via.placeholder.com/30?text=Admin'
                            : 'https://via.placeholder.com/30?text=Host';
                        }}
                      />
                    </div>
                    <div className="host-info-container">
                      <span className={`host-name ${car.hostDetails?.isAdmin ? 'admin-host' : ''}`}>
                        {car.hostDetails?.isAdmin ? 'Managed by ' : 'Hosted by '}
                        {car.hostDetails?.name || (car.hostDetails?.isAdmin ? 'Admin' : 'Host')}
                      </span>
                    </div>
                  </div>
                  <div className="car-features">
                    {car.features && car.features.length > 0 ? (
                      <>
                        {car.features.slice(0, 4).map((feature, index) => (
                          <span key={index} className="feature-tag">{feature}</span>
                        ))}
                        {car.features.length > 4 && (
                          <span className="feature-tag more-features">+{car.features.length - 4} more</span>
                        )}
                      </>
                    ) : (
                      <span className="feature-tag">Standard Features</span>
                    )}
                  </div>
                  <div className="car-actions">
                    <button
                      className="quick-preview-btn"
                      onClick={() => {
                        setSelectedCar(car);
                        setShowPreviewModal(true);
                      }}
                    >
                      <span>Quick View</span>
                    </button>
                    <Link
                      to={`/cars/${car._id}`}
                      className="view-details-btn"
                    >
                      <span>View Detail</span>
                    </Link>
                    <Link
                      to={`/cars/${car._id}`}
                      className="book-now-btn"
                    >
                      <span>Book</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

      {/* Car Preview Modal */}
      <QuickActionModal
      show={showPreviewModal}
      onClose={() => setShowPreviewModal(false)}
      title={selectedCar ? `${selectedCar.brand} ${selectedCar.model} (${selectedCar.year})` : 'Car Preview'}
      type="preview"
      size="large"
    >
      {selectedCar && (
        <div className="car-preview-content">
          <div className="car-preview-gallery">
            {selectedCar.images && selectedCar.images.length > 0 ? (
              <img
                src={selectedCar.images[0]}
                alt={`${selectedCar.brand} ${selectedCar.model}`}
                className="car-preview-main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getLocalCarFallbackImage(selectedCar);
                }}
              />
            ) : (
              <img
                src={getLocalCarFallbackImage(selectedCar)}
                alt={`${selectedCar.brand} ${selectedCar.model}`}
                className="car-preview-main-image"
              />
            )}

            {selectedCar.images && selectedCar.images.length > 1 && (
              <div className="car-preview-thumbnails">
                {selectedCar.images.slice(1, 5).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${selectedCar.brand} ${selectedCar.model} view ${index + 2}`}
                    className="car-preview-thumbnail"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = getLocalCarFallbackImage(selectedCar);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="car-preview-details">
            <div className="car-preview-price-rating">
              <div className="car-preview-price">
                <span className="price-label">Price per day:</span>
                <span className="price-value">${selectedCar.pricePerDay || selectedCar.price || 0}</span>
              </div>

              <div className="car-preview-rating">
                <span className="stars">{'★'.repeat(Math.floor(selectedCar.averageRating || 0))}{'☆'.repeat(5 - Math.floor(selectedCar.averageRating || 0))}</span>
                <span className="rating-value">{selectedCar.averageRating ? selectedCar.averageRating.toFixed(1) : 'New'}</span>
                <span className="review-count">({selectedCar.reviewCount || 0} reviews)</span>
              </div>
            </div>

            <div className="car-preview-specs">
              <div className="spec-item">
                <FontAwesomeIcon icon={faCar} className="spec-icon" />
                <span className="spec-label">Type:</span>
                <span className="spec-value">{selectedCar.type || 'N/A'}</span>
              </div>

              <div className="spec-item">
                <FontAwesomeIcon icon={faCalendarAlt} className="spec-icon" />
                <span className="spec-label">Year:</span>
                <span className="spec-value">{selectedCar.year || 'N/A'}</span>
              </div>

              <div className="spec-item">
                <FontAwesomeIcon icon={faGasPump} className="spec-icon" />
                <span className="spec-label">Fuel:</span>
                <span className="spec-value">{selectedCar.fuelType || selectedCar.fuel_type || 'N/A'}</span>
              </div>

              <div className="spec-item">
                <FontAwesomeIcon icon={faUsers} className="spec-icon" />
                <span className="spec-label">Seats:</span>
                <span className="spec-value">{selectedCar.seatingCapacity || 'N/A'}</span>
              </div>

              <div className="spec-item">
                <FontAwesomeIcon icon={faTachometerAlt} className="spec-icon" />
                <span className="spec-label">Transmission:</span>
                <span className="spec-value">{selectedCar.transmission || 'N/A'}</span>
              </div>
            </div>

            <div className="car-preview-features">
              <h4>Features</h4>
              <div className="features-list">
                {selectedCar.features && selectedCar.features.length > 0 ? (
                  selectedCar.features.map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))
                ) : (
                  <span className="feature-tag">Standard Features</span>
                )}
              </div>
            </div>

            <div className="car-preview-host">
              <h4>{selectedCar.hostDetails?.isAdmin ? 'Managed by' : 'Hosted by'}</h4>
              <div className="host-preview-info">
                <img
                  src={selectedCar.hostDetails?.profileImage || (selectedCar.hostDetails?.isAdmin ? 'https://via.placeholder.com/50?text=Admin' : 'https://via.placeholder.com/50?text=Host')}
                  alt={`${selectedCar.hostDetails?.isAdmin ? 'Admin' : 'Host'} ${selectedCar.hostDetails?.name || 'Unknown'}`}
                  className="host-preview-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = selectedCar.hostDetails?.isAdmin
                      ? 'https://via.placeholder.com/50?text=Admin'
                      : 'https://via.placeholder.com/50?text=Host';
                  }}
                />
                <span className="host-preview-name">
                  {selectedCar.hostDetails?.name || (selectedCar.hostDetails?.isAdmin ? 'Admin' : 'Host')}
                </span>
              </div>
            </div>

            <div className="car-preview-actions">
              <Link
                to={`/cars/${selectedCar._id}`}
                className="preview-view-details-btn"
                onClick={() => setShowPreviewModal(false)}
              >
                <span>View Detail</span>
              </Link>
              <Link
                to={`/cars/${selectedCar._id}`}
                className="preview-book-now-btn"
                onClick={() => setShowPreviewModal(false)}
              >
                <span>Book</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </QuickActionModal>
    </>
  );
};

export default CarListing;
