const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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

const importReviews = async () => {
  try {
    // Wait for connection to be established
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get database connection
    const db = mongoose.connection.db;

    // Check if reviews collection exists and drop it
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('reviews')) {
      await db.collection('reviews').drop();
      console.log('Dropped existing reviews collection');
    }

    // Read reviews.json file
    const reviewsData = fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf8');
    const reviewsJson = JSON.parse(reviewsData);
    console.log(`Found ${reviewsJson.length} reviews to import`);

    // Get users and cars from database
    const users = await db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users`);

    let cars = await db.collection('cars').find({}).toArray();

    // Create cars if none exist
    if (cars.length === 0) {
      console.log('No cars found. Creating sample cars...');

      const sampleCars = [
        {
          name: 'Toyota Camry',
          make: 'Toyota',
          model: 'Camry',
          year: 2023,
          price: 25000,
          available: true
        },
        {
          name: 'Honda Civic',
          make: 'Honda',
          model: 'Civic',
          year: 2022,
          price: 22000,
          available: true
        },
        {
          name: 'Tesla Model 3',
          make: 'Tesla',
          model: 'Model 3',
          year: 2023,
          price: 45000,
          available: true
        }
      ];

      const result = await db.collection('cars').insertMany(sampleCars);
      cars = await db.collection('cars').find({}).toArray();
      console.log(`Created ${cars.length} sample cars`);
    }

    // Create reviews collection
    await db.createCollection('reviews');

    // Prepare reviews for import
    const reviewsToImport = [];

    for (const review of reviewsJson) {
      // Get random user and car
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCar = cars[Math.floor(Math.random() * cars.length)];

      reviewsToImport.push({
        userId: randomUser._id,
        carId: randomCar._id,
        rating: review.rating || Math.floor(Math.random() * 5) + 1,
        comment: review.comment || 'Great car, highly recommended!',
        createdAt: new Date()
      });
    }

    // Insert reviews
    const result = await db.collection('reviews').insertMany(reviewsToImport);
    console.log(`Successfully imported ${result.insertedCount} reviews`);

  } catch (error) {
    console.error('Error importing reviews:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

importReviews();
