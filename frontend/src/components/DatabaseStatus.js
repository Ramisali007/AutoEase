import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/DatabaseStatus.css';

const DatabaseStatus = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        console.log('Checking database connection...');
        // Use axios directly to avoid any issues with the api service
        const response = await axios.get('http://localhost:5000/api/db-status');
        console.log('Database status response:', response.data);

        if (response.data.connected) {
          setStatus('connected');
          setDetails(response.data);
        } else {
          setStatus('disconnected');
          setError(response.data.error || 'Unknown error');
        }
      } catch (err) {
        console.error('Database connection check failed:', err);

        // Try to connect to MongoDB directly to check if it's running
        try {
          const mongoStatus = await axios.get('http://localhost:27017');
          console.log('Direct MongoDB connection response:', mongoStatus);
          setStatus('error');
          setError('API endpoint not available, but MongoDB may be running');
        } catch (mongoErr) {
          console.error('Direct MongoDB connection failed:', mongoErr);
          setStatus('error');
          if (mongoErr.code === 'ECONNREFUSED') {
            setError('MongoDB server is not running. Please start MongoDB.');
          } else {
            setError(err.message || 'Failed to check database connection');
          }
        }
      }
    };

    checkDatabaseConnection();
  }, []);

  return (
    <div className="database-status">
      <h3>MongoDB Connection Status</h3>
      <div className={`status-indicator ${status}`}>
        {status === 'checking' && (
          <>
            <div className="spinner"></div>
            <p>Checking database connection...</p>
          </>
        )}
        {status === 'connected' && (
          <>
            <div className="status-icon connected">✓</div>
            <p>Connected to MongoDB</p>
            {details && (
              <div className="connection-details">
                <p><strong>Database:</strong> {details.database}</p>
                <p><strong>Host:</strong> {details.host}</p>
                <p><strong>Last Updated:</strong> {new Date(details.timestamp).toLocaleString()}</p>

                <div className="collections-stats">
                  <h4>Collections:</h4>
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Collection</th>
                        <th>Documents</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.collections?.map(collection => (
                        <tr key={collection}>
                          <td>{collection}</td>
                          <td>{details.collectionStats?.[collection] || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  className="refresh-button"
                  onClick={() => window.location.reload()}
                  title="Refresh data from database"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </>
        )}
        {status === 'disconnected' && (
          <>
            <div className="status-icon disconnected">✗</div>
            <p>Disconnected from MongoDB</p>
            {error && <p className="error-message">{error}</p>}
          </>
        )}
        {status === 'error' && (
          <>
            <div className="status-icon error">!</div>
            <p>Error checking MongoDB connection</p>
            {error && <p className="error-message">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatus;
