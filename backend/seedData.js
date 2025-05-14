const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const connectDB = require('./config/db');

// Connect to database
connectDB();

// Sample users data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    phone: '1234567890',
    address: '123 Admin Street',
    driverLicense: 'ADM123456',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '9876543210',
    address: '456 User Avenue',
    driverLicense: 'USR789012',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    phone: '5551234567',
    address: '789 Customer Road',
    driverLicense: 'USR345678',
    role: 'user'
  }
];

// Sample cars data
const cars = [
  {
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    type: 'Sedan',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 75,
    mileage: 40,
    features: [
      'Bluetooth',
      'Backup Camera',
      'Cruise Control',
      'Navigation System',
      'Keyless Entry',
      'Heated Seats'
    ],
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    isAvailable: true
  },
  {
    brand: 'Honda',
    model: 'CR-V',
    year: 2022,
    type: 'SUV',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 85,
    mileage: 32,
    features: [
      'Bluetooth',
      'Backup Camera',
      'Cruise Control',
      'Apple CarPlay',
      'Android Auto',
      'Sunroof'
    ],
    images: [
      'https://images.unsplash.com/photo-1568844293986-ca9c5c1bc2e8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    isAvailable: true
  },
  {
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    type: 'Sedan',
    fuelType: 'Electric',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 120,
    mileage: 0,
    features: [
      'Autopilot',
      'Premium Sound System',
      'Heated Seats',
      'Glass Roof',
      'Navigation',
      'Supercharger Access'
    ],
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80'
    ],
    isAvailable: true
  },
  {
    brand: 'BMW',
    model: 'X5',
    year: 2022,
    type: 'SUV',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seatingCapacity: 7,
    pricePerDay: 150,
    mileage: 28,
    features: [
      'Leather Seats',
      'Panoramic Sunroof',
      'Premium Sound System',
      'Navigation',
      'Heated Seats',
      'Parking Sensors'
    ],
    images: [
      'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    isAvailable: true
  },
  {
    brand: 'Ford',
    model: 'Mustang',
    year: 2023,
    type: 'Sports',
    fuelType: 'Petrol',
    transmission: 'Manual',
    seatingCapacity: 4,
    pricePerDay: 130,
    mileage: 25,
    features: [
      'Leather Seats',
      'Premium Sound System',
      'Backup Camera',
      'Bluetooth',
      'Keyless Entry',
      'Performance Package'
    ],
    images: [
      'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    isAvailable: true
  },
  {
    brand: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2022,
    type: 'Luxury',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 160,
    mileage: 30,
    features: [
      'Leather Seats',
      'Premium Sound System',
      'Navigation',
      'Heated Seats',
      'Parking Assist',
      'Driver Assistance Package'
    ],
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    isAvailable: true
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    
    console.log('Previous data deleted successfully');
    
    // Create users with hashed passwords
    const createdUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      createdUsers.push(newUser);
    }
    
    console.log(`${createdUsers.length} users created successfully`);
    
    // Create cars
    const createdCars = await Car.insertMany(cars);
    console.log(`${createdCars.length} cars created successfully`);
    
    // Create sample bookings
    const bookings = [
      {
        user: createdUsers[1]._id, // John Doe
        car: createdCars[0]._id, // Toyota Camry
        startDate: new Date('2023-05-15'),
        endDate: new Date('2023-05-20'),
        pickupLocation: 'Airport Terminal 1',
        totalAmount: 375, // 5 days * $75
        paymentStatus: 'Completed',
        bookingStatus: 'Completed',
        contractGenerated: true,
        invoiceNumber: 'INV-1683936000000'
      },
      {
        user: createdUsers[2]._id, // Jane Smith
        car: createdCars[1]._id, // Honda CR-V
        startDate: new Date('2023-06-10'),
        endDate: new Date('2023-06-15'),
        pickupLocation: 'Downtown Office',
        totalAmount: 425, // 5 days * $85
        paymentStatus: 'Completed',
        bookingStatus: 'Completed',
        contractGenerated: true,
        invoiceNumber: 'INV-1686355200000'
      },
      {
        user: createdUsers[1]._id, // John Doe
        car: createdCars[2]._id, // Tesla Model 3
        startDate: new Date('2023-07-05'),
        endDate: new Date('2023-07-10'),
        pickupLocation: 'Tesla Showroom',
        totalAmount: 600, // 5 days * $120
        paymentStatus: 'Completed',
        bookingStatus: 'Completed',
        contractGenerated: true,
        invoiceNumber: 'INV-1688515200000'
      }
    ];
    
    const createdBookings = await Booking.insertMany(bookings);
    console.log(`${createdBookings.length} bookings created successfully`);
    
    // Create sample reviews
    const reviews = [
      {
        user: createdUsers[1]._id, // John Doe
        car: createdCars[0]._id, // Toyota Camry
        booking: createdBookings[0]._id,
        rating: 5,
        comment: 'Excellent car! Very comfortable and fuel-efficient. Would definitely rent again.'
      },
      {
        user: createdUsers[2]._id, // Jane Smith
        car: createdCars[1]._id, // Honda CR-V
        booking: createdBookings[1]._id,
        rating: 4,
        comment: 'Great SUV with plenty of space. The only issue was a small scratch on the door.'
      },
      {
        user: createdUsers[1]._id, // John Doe
        car: createdCars[2]._id, // Tesla Model 3
        booking: createdBookings[2]._id,
        rating: 5,
        comment: 'Amazing electric car! The autopilot feature is incredible. Highly recommended!'
      }
    ];
    
    const createdReviews = await Review.insertMany(reviews);
    console.log(`${createdReviews.length} reviews created successfully`);
    
    // Update car ratings based on reviews
    for (const car of createdCars) {
      const carReviews = await Review.find({ car: car._id });
      if (carReviews.length > 0) {
        const totalRating = carReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / carReviews.length;
        
        await Car.findByIdAndUpdate(car._id, {
          averageRating,
          reviewCount: carReviews.length
        });
      }
    }
    
    console.log('Car ratings updated successfully');
    console.log('Database seeded successfully!');
    
    // Disconnect from database
    mongoose.disconnect();
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
