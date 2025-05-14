const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('./models/User');

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

// Define Review Schema
const ReviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Review model if it doesn't exist
const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

// Define Car Schema (simplified for this script)
const CarSchema = new mongoose.Schema({
  name: String,
  make: String,
  model: String,
  year: Number,
  price: Number,
  available: Boolean
});

// Create Car model if it doesn't exist
const Car = mongoose.models.Car || mongoose.model('Car', CarSchema);

// Import reviews from JSON file
const importReviews = async () => {
  try {
    // Read reviews.json file
    const reviewsData = fs.readFileSync(path.join(__dirname, 'reviews.json'), 'utf8');
    const reviews = JSON.parse(reviewsData);

    console.log(`Found ${reviews.length} reviews to import`);

    // Get all users from the database
    const users = await User.find();
    if (users.length === 0) {
      console.error('No users found in the database. Please run seedUser.js first.');
      process.exit(1);
    }
    console.log(`Found ${users.length} users in the database`);

    // Get all cars from the database or create sample cars if none exist
    let cars = await Car.find();
    if (cars.length === 0) {
      console.log('No cars found in the database. Creating sample cars...');

      // Create sample cars
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

      cars = await Car.insertMany(sampleCars);
      console.log(`Created ${cars.length} sample cars`);
    }

    // Delete existing reviews
    await Review.deleteMany({});
    console.log('Deleted existing reviews');

    // Process and import reviews one by one
    let successCount = 0;

    for (const review of reviews) {
      try {
        // Assign a random user and car for each review
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomCar = cars[Math.floor(Math.random() * cars.length)];

        const newReview = new Review({
          userId: randomUser._id,
          carId: randomCar._id,
          rating: review.rating || Math.floor(Math.random() * 5) + 1,
          comment: review.comment || 'Great car, highly recommended!',
          createdAt: new Date()
        });

        await newReview.save();
        successCount++;
      } catch (err) {
        console.error(`Error importing review: ${err.message}`);
      }
    }

    console.log(`Successfully imported ${successCount} out of ${reviews.length} reviews`);

  } catch (error) {
    console.error('Error importing reviews:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

importReviews();
