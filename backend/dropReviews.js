const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/autoease', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

const dropReviewsCollection = async () => {
  try {
    // Wait for connection to be established
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if the collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('reviews')) {
      // Drop the reviews collection
      await mongoose.connection.db.collection('reviews').drop();
      console.log('Reviews collection dropped successfully');
    } else {
      console.log('Reviews collection does not exist, nothing to drop');
    }
  } catch (error) {
    console.error('Error dropping reviews collection:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

dropReviewsCollection();
