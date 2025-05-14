// models/Car.js
const mongoose = require('mongoose');

// Define a GeoJSON Point Schema for location
const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [0, 0]
  }
});

const CarSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Please add a brand']
  },
  model: {
    type: String,
    required: [true, 'Please add a model']
  },
  year: {
    type: Number,
    required: [true, 'Please add a year']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Making owner field optional
  },
  hostDetails: {
    name: {
      type: String,
      default: 'Host'
      // Making host name optional
    },
    profileImage: {
      type: String,
      default: 'https://via.placeholder.com/150'
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: 'admin@autoease.com'
      // Making host email optional
    },
    hostingSince: {
      type: Date,
      default: Date.now
    },
    bio: {
      type: String,
      default: ''
    },
    responseRate: {
      type: Number,
      default: 100
    },
    responseTime: {
      type: String,
      default: 'Within an hour'
    },
    averageRating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  type: {
    type: String,
    required: [true, 'Please add a car type'],
    enum: ['Sedan', 'SUV', 'Hatchback', 'Convertible', 'Sports', 'Luxury', 'Van', 'Coupe', 'Minivan', 'Truck']
  },
  fuelType: {
    type: String,
    required: [true, 'Please add a fuel type'],
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']
  },
  transmission: {
    type: String,
    required: [true, 'Please add transmission type'],
    enum: ['Manual', 'Automatic']
  },
  seatingCapacity: {
    type: Number,
    required: [true, 'Please add seating capacity']
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Please add price per day']
  },
  mileage: {
    type: Number
  },
  description: {
    type: String
  },
  features: [String],
  images: {
    type: [String],
    required: [true, 'Please add at least one car image'],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one car image is required'
    }
  },
  location: {
    address: {
      type: String,
      default: ''
    },
    coordinates: {
      type: PointSchema,
      default: () => ({
        type: 'Point',
        coordinates: [0, 0]
      })
    }
  },
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

// Add 2dsphere index for geospatial queries
CarSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Car', CarSchema);