// Script to make all cars available
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Define Car Schema
const CarSchema = new mongoose.Schema({
  brand: String,
  model: String,
  year: Number,
  type: String,
  fuelType: String,
  transmission: String,
  seatingCapacity: Number,
  pricePerDay: Number,
  mileage: Number,
  description: String,
  features: [String],
  images: [String],
  isAvailable: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create Car model if it doesn't exist
const Car = mongoose.models.Car || mongoose.model('Car', CarSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB Connected');
  
  try {
    // Update all cars to be available
    const result = await Car.updateMany(
      {}, // Empty filter to match all cars
      { isAvailable: true }
    );
    
    console.log(`Successfully updated ${result.modifiedCount} cars to be available`);
    
    // Get count of available cars
    const availableCars = await Car.countDocuments({ isAvailable: true });
    console.log(`Total available cars: ${availableCars}`);
    
    // Get total car count
    const totalCars = await Car.countDocuments();
    console.log(`Total cars in database: ${totalCars}`);
    
  } catch (error) {
    console.error('Error updating cars:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB Connection Closed');
  }
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});
