import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SubscriberService from '../services/subscriber.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSort, faFileExport } from '@fortawesome/free-solid-svg-icons';
import '../assets/SubscribersList.css';
import '../assets/AdminDashboard.css';

const SubscribersList = () => {
  const { currentUser } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    // Load subscribers from API or localStorage
    const loadSubscribers = async () => {
      try {
        setIsLoading(true);

        // Try to get subscribers from the service (which tries API first, then localStorage)
        const response = await SubscriberService.getAllSubscribers();

        let subscribersData = [];

        if (response.fromLocalStorage) {
          // Data is from localStorage
          subscribersData = response.data;
        } else if (response.data && Array.isArray(response.data)) {
          // Data is from API
          subscribersData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          // Data is from API with a different structure
          subscribersData = response.data.data;
        }

        setSubscribers(subscribersData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading subscribers:', error);

        // Fallback to localStorage if everything else fails
        try {
          const storedSubscribers = SubscriberService.getFromLocalStorage();

          // Convert to array of objects with subscription date
          const subscribersWithDate = storedSubscribers.map(email => {
            return {
              email,
              subscriptionDate: new Date().toISOString() // Default to current date
            };
          });

          setSubscribers(subscribersWithDate);
        } catch (localStorageError) {
          console.error('Error with localStorage fallback:', localStorageError);
          setError('Failed to load subscribers');
        }

        setIsLoading(false);
      }
    };

    loadSubscribers();
  }, []);

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort subscribers
  const sortedSubscribers = [...filteredSubscribers].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.subscriptionDate) - new Date(a.subscriptionDate);
    } else if (sortOrder === 'oldest') {
      return new Date(a.subscriptionDate) - new Date(b.subscriptionDate);
    } else if (sortOrder === 'a-z') {
      return a.email.localeCompare(b.email);
    } else {
      return b.email.localeCompare(a.email);
    }
  });

  // Export subscribers to CSV
  const exportToCSV = () => {
    const csvContent =
      "Email,Subscription Date\n" +
      subscribers.map(sub =>
        `${sub.email},"${new Date(sub.subscriptionDate).toLocaleString()}"`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Subscribers <span className="count-badge">{subscribers.length}</span></h2>
      </div>

      <div className="subscribers-controls">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} style={{ color: '#4361ee', marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              width: '300px',
              fontSize: '14px'
            }}
          />
        </div>
        <div className="sort-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={faSort} style={{ color: '#4361ee' }} />
          <label style={{ fontSize: '14px', color: '#4a5568' }}>Sort by:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              fontSize: '14px'
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
          </select>
        </div>
        <button
          className="btn-view"
          onClick={exportToCSV}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FontAwesomeIcon icon={faFileExport} /> Export to CSV
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading subscribers...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : sortedSubscribers.length === 0 ? (
        <div className="no-subscribers">
          {searchTerm ? 'No subscribers match your search' : 'No subscribers yet'}
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Subscription Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubscribers.map((subscriber, index) => (
                <tr key={index}>
                  <td>{subscriber.email}</td>
                  <td>{new Date(subscriber.subscriptionDate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubscribersList;
