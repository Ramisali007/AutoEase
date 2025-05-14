const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Car = require('./models/Car');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to DB
const mongoURI = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/autoease';
console.log('Connecting to MongoDB at:', mongoURI);
mongoose.connect(mongoURI);

// Sample user data
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
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    phone: '9876543210',
    address: '456 User Avenue',
    driverLicense: 'USR789012',
    role: 'user'
  }
];

// Sample car data
const cars = [
  {
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    type: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 50,
    mileage: 35,
    features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'USB Ports'],
    images: ['/images/corolla.jpeg'],
    description: 'The Toyota Corolla is a reliable and fuel-efficient compact sedan perfect for daily commuting. With its comfortable interior, advanced safety features, and excellent fuel economy, the Corolla offers great value for money. This model comes with a smooth automatic transmission and modern connectivity features to enhance your driving experience.',
    isAvailable: true,
    location: {
      address: 'Gulberg III, Lahore, Pakistan',
      coordinates: {
        type: 'Point',
        coordinates: [74.3587, 31.5204] // [longitude, latitude] for Lahore
      }
    }
  },
  {
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    type: 'Sedan',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 65,
    mileage: 40,
    features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'Heated Seats', 'Navigation'],
    images: ['/images/camry.jpg'],
    description: 'The Toyota Camry Hybrid combines elegance with efficiency, offering a premium driving experience with exceptional fuel economy. This midsize sedan features a spacious interior with high-quality materials, advanced hybrid technology, and a smooth, quiet ride. Equipped with heated seats and an intuitive navigation system, the Camry Hybrid delivers both comfort and sophistication for business trips or family outings.',
    isAvailable: true,
    location: {
      address: 'DHA Phase 5, Lahore, Pakistan',
      coordinates: {
        type: 'Point',
        coordinates: [74.3742, 31.4697] // [longitude, latitude] for DHA Phase 5
      }
    }
  },
  {
    brand: 'Honda',
    model: 'Civic',
    year: 2022,
    type: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 55,
    mileage: 36,
    features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay', 'Android Auto'],
    images: ['/images/civic.jpg'],
    description: 'The Honda Civic continues to set the standard for compact cars with its blend of performance, efficiency, and technology. This 2022 model features a sleek, modern design with a surprisingly spacious interior and premium finishes. With seamless smartphone integration through Apple CarPlay and Android Auto, the Civic keeps you connected while delivering responsive handling and excellent fuel economy, making it perfect for both city driving and longer journeys.',
    isAvailable: true,
    location: {
      address: 'Johar Town, Lahore, Pakistan',
      coordinates: {
        type: 'Point',
        coordinates: [74.2973, 31.4697] // [longitude, latitude] for Johar Town
      }
    }
  },
  {
    brand: 'BMW',
    model: '3 Series',
    year: 2023,
    type: 'Luxury',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 120,
    mileage: 28,
    features: ['Leather Seats', 'Navigation', 'Sunroof', 'Premium Sound System', 'Heated Seats'],
    images: ['/images/bmw.jpeg'],
    description: 'The BMW 3 Series represents the perfect balance of luxury, performance, and driving dynamics. This iconic sports sedan delivers an exhilarating driving experience with its powerful engine and precise handling. Inside, you\'ll find premium leather seats, an intuitive navigation system, and a high-end sound system for an immersive audio experience. The panoramic sunroof adds an airy feel to the sophisticated cabin, making every journey in this BMW a memorable one.',
    isAvailable: true,
    location: {
      address: 'Model Town, Lahore, Pakistan',
      coordinates: {
        type: 'Point',
        coordinates: [74.3230, 31.4820] // [longitude, latitude] for Model Town
      }
    }
  },
  {
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    type: 'Sedan',
    fuelType: 'Electric',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 130,
    mileage: 120,
    features: ['Autopilot', 'Premium Sound System', 'Heated Seats', 'Navigation'],
    images: ['/images/tesla.jpeg'],
    description: 'Experience the future of driving with the Tesla Model 3, a revolutionary all-electric vehicle that combines cutting-edge technology with sustainable performance. With its minimalist interior centered around a large touchscreen display, the Model 3 offers a tech-forward driving experience unlike any other. The Autopilot feature provides advanced driver assistance, while the instant torque from the electric motor delivers exhilarating acceleration. With zero emissions and exceptional range, this Tesla represents the perfect blend of innovation, performance, and environmental consciousness.',
    isAvailable: true,
    location: {
      address: 'Bahria Town, Lahore, Pakistan',
      coordinates: {
        type: 'Point',
        coordinates: [74.2415, 31.3695] // [longitude, latitude] for Bahria Town
      }
    }
  },
  {
    brand: 'Ford',
    model: 'Mustang',
    year: 2022,
    type: 'Sports',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 4,
    pricePerDay: 110,
    mileage: 22,
    features: ['Leather Seats', 'Bluetooth', 'Backup Camera', 'Premium Sound System'],
    images: ['/images/mustang.jpeg'],
    description: 'The Ford Mustang is an American icon that delivers thrilling performance and head-turning style. This legendary sports car combines raw power with modern technology, featuring a muscular engine that produces an exhilarating exhaust note. The premium leather interior and advanced sound system create a comfortable yet exciting driving environment. With its distinctive design and impressive acceleration, the Mustang offers an authentic sports car experience that embodies the spirit of freedom and adventure on the open road.',
    isAvailable: true,
    location: {
      address: 'Valencia Town, Lahore, Pakistan',
      coordinates: {
        type: 'Point',
        coordinates: [74.2421, 31.4012] // [longitude, latitude] for Valencia Town
      }
    }
  },
  {
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2023,
    type: 'Luxury',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 135,
    mileage: 26,
    features: ['Leather Seats', 'Navigation', 'Sunroof', 'Premium Sound System', 'Heated Seats'],
    images: ['/images/mercedes.jpeg'],
    description: 'The Mercedes-Benz C-Class exemplifies German engineering excellence, offering a perfect combination of luxury, comfort, and performance. This sophisticated sedan features an elegant interior crafted with premium materials and meticulous attention to detail. The smooth and responsive powertrain delivers a refined driving experience, while advanced technology features keep you connected and entertained. With its prestigious badge, striking design, and comprehensive suite of luxury amenities, the C-Class provides an upscale driving experience that makes every journey special.',
    isAvailable: true,
    location: {
      address: 'DHA Phase 8, Lahore, Pakistan',
      coordinates: {
        type: 'Point',
        coordinates: [74.4023, 31.4805] // [longitude, latitude] for DHA Phase 8
      }
    }
  },
  {
    brand: 'Audi',
    model: 'A4',
    year: 2022,
    type: 'Luxury',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 125,
    mileage: 27,
    features: ['Leather Seats', 'Navigation', 'Sunroof', 'Premium Sound System'],
    images: ['/images/audi.jpeg'],
    description: 'The Audi A4 represents the pinnacle of understated luxury and technological innovation. This premium sedan combines sophisticated design with exceptional build quality, featuring Audi\'s renowned Quattro all-wheel-drive system for confident handling in all conditions. The interior showcases minimalist elegance with high-quality materials and Audi\'s intuitive MMI infotainment system. With its perfect balance of comfort, performance, and cutting-edge technology, the A4 delivers a refined driving experience that appeals to discerning drivers who appreciate subtle luxury and engineering excellence.',
    isAvailable: true,
    location: {
      address: 'Cantt, Lahore, Pakistan',
      coordinates: {
        type: 'Point',
        coordinates: [74.3794, 31.5476] // [longitude, latitude] for Cantt
      }
    }
  },
  {
    brand: 'Hyundai',
    model: 'Elantra',
    year: 2022,
    type: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 45,
    mileage: 37,
    features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay', 'Android Auto'],
    images: ['/images/elantra.jpeg'],
    description: 'The Hyundai Elantra offers exceptional value with its bold styling, impressive fuel efficiency, and comprehensive feature set. This compact sedan stands out with its distinctive exterior design and surprisingly spacious interior. The user-friendly technology includes seamless smartphone integration through Apple CarPlay and Android Auto, keeping you connected on the go. With its smooth ride, responsive handling, and excellent warranty coverage, the Elantra delivers a compelling combination of style, comfort, and practicality that exceeds expectations in its class.',
    isAvailable: true,
    location: {
      address: 'Faisal Town, Lahore, Pakistan',
      coordinates: {
        type: 'Point',
        coordinates: [74.2995, 31.4789] // [longitude, latitude] for Faisal Town
      }
    }
  },
  {
    brand: 'Nissan',
    model: 'Altima',
    year: 2022,
    type: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 48,
    mileage: 32,
    features: ['Bluetooth', 'Backup Camera', 'Cruise Control'],
    images: ['/images/nissan.jpeg'],
    description: 'The Nissan Altima combines reliability, comfort, and efficiency in a stylish midsize sedan package. With its aerodynamic design and comfortable interior, the Altima is perfect for both daily commutes and longer road trips. The responsive engine provides a good balance of power and fuel economy, while the smooth-shifting automatic transmission ensures a relaxed driving experience. Safety features like the backup camera and advanced driver assistance systems provide peace of mind, making the Altima a practical and dependable choice for individuals and families alike.',
    isAvailable: true,
    location: {
      address: 'Iqbal Town, Lahore, Pakistan',
      coordinates: {
        type: 'Point',
        coordinates: [74.2890, 31.5010] // [longitude, latitude] for Iqbal Town
      }
    }
  },
  {
    brand: 'Kia',
    model: 'Optima',
    year: 2022,
    type: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 47,
    mileage: 34,
    features: ['Bluetooth', 'Backup Camera', 'Apple CarPlay', 'Android Auto'],
    images: ['/images/kia.jpeg'],
    description: 'The Kia Optima offers a compelling blend of style, features, and value in the midsize sedan segment. With its sleek exterior design and well-crafted interior, the Optima makes a strong first impression. The cabin provides ample space for passengers and luggage, while the intuitive technology features, including Apple CarPlay and Android Auto, ensure seamless connectivity. The smooth and efficient powertrain delivers a comfortable ride with good fuel economy. Backed by Kia\'s excellent warranty, the Optima represents a smart choice for those seeking a well-rounded sedan that punches above its weight class.',
    isAvailable: true,
    location: {
      address: 'Wapda Town, Lahore, Pakistan',
      coordinates: {
        type: 'Point',
        coordinates: [74.2421, 31.4589] // [longitude, latitude] for Wapda Town
      }
    }
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear the database
    await User.deleteMany();
    await Car.deleteMany();
    console.log('Previous data deleted successfully');

    // Create new users
    await User.create(users);
    console.log(`${users.length} users created`);

    // Create new cars
    await Car.create(cars);
    console.log(`${cars.length} cars created`);

    console.log('New data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Car.deleteMany();
    console.log('All data deleted successfully');
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Seed only car data
const seedCarsOnly = async () => {
  try {
    // Clear only car data
    await Car.deleteMany();
    console.log('Previous car data deleted successfully');

    // Create new cars
    await Car.create(cars);
    console.log(`${cars.length} cars created`);

    console.log('Car data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Command line arguments
// -i: import all data (users and cars)
// -d: delete all data
// -c: seed only car data
if (process.argv[2] === '-d') {
  deleteData();
} else if (process.argv[2] === '-c') {
  seedCarsOnly();
} else {
  // Default to import all data if no argument or -i is provided
  importData();
}

