// routes/db-status.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Route to check MongoDB connection status
router.get('/', async (req, res) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState === 1) {
      // Get database information
      const dbName = mongoose.connection.db.databaseName;
      const host = mongoose.connection.host;

      // Get collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      // Get document counts for each collection
      const collectionStats = {};
      for (const collName of collectionNames) {
        try {
          const count = await mongoose.connection.db.collection(collName).countDocuments();
          collectionStats[collName] = count;
        } catch (err) {
          console.error(`Error counting documents in ${collName}:`, err);
          collectionStats[collName] = 'Error';
        }
      }

      return res.status(200).json({
        connected: true,
        database: dbName,
        host: host,
        collections: collectionNames,
        collectionStats: collectionStats,
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
      });
    } else {
      // Not connected
      return res.status(200).json({
        connected: false,
        readyState: mongoose.connection.readyState,
        error: 'Database not connected',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error checking database status:', error);
    return res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

module.exports = router;
