// Seed data for the application
// This file contains mock data for development and testing

// 6 Cars with detailed information
export const cars = [
  {
    _id: 'car1',
    brand: 'Toyota',
    model: 'Camry',
    year: 2023,
    type: 'Sedan',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 75,
    mileage: '40 mpg',
    features: [
      'Bluetooth',
      'Backup Camera',
      'Cruise Control',
      'Navigation System',
      'Keyless Entry',
      'Heated Seats'
    ],
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1936&q=80'
    ],
    description: 'The Toyota Camry is a comfortable and fuel-efficient sedan, perfect for business trips or family vacations. This hybrid model offers excellent fuel economy and a smooth driving experience.',
    averageRating: 4.7,
    reviewCount: 42,
    availability: true
  },
  {
    _id: 'car2',
    brand: 'Honda',
    model: 'CR-V',
    year: 2022,
    type: 'SUV',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 85,
    mileage: '32 mpg',
    features: [
      'All-Wheel Drive',
      'Apple CarPlay',
      'Android Auto',
      'Sunroof',
      'Leather Seats',
      'Collision Warning'
    ],
    images: [
      'https://cdn.pixabay.com/photo/2017/08/31/05/47/honda-2699217_1280.jpg',
      'https://cdn.pixabay.com/photo/2017/03/27/14/56/auto-2179220_1280.jpg'
    ],
    description: 'The Honda CR-V is a versatile and reliable SUV with ample cargo space and comfortable seating for five. Perfect for weekend getaways or navigating city streets.',
    averageRating: 4.5,
    reviewCount: 38,
    availability: true
  },
  {
    _id: 'car3',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    type: 'Electric',
    fuelType: 'Electric',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 120,
    mileage: '358 miles per charge',
    features: [
      'Autopilot',
      'Premium Sound System',
      'Glass Roof',
      'Supercharger Access',
      'Heated Seats',
      'Smart Summon'
    ],
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    description: 'Experience the future of driving with the Tesla Model 3. This all-electric vehicle offers impressive range, cutting-edge technology, and zero emissions.',
    averageRating: 4.9,
    reviewCount: 56,
    availability: true
  },
  {
    _id: 'car4',
    brand: 'Ford',
    model: 'Mustang',
    year: 2022,
    type: 'Sports',
    fuelType: 'Gasoline',
    transmission: 'Manual',
    seatingCapacity: 4,
    pricePerDay: 110,
    mileage: '25 mpg',
    features: [
      'V8 Engine',
      'Leather Seats',
      'Premium Sound System',
      'Rear View Camera',
      'Keyless Entry',
      'Sport Mode'
    ],
    images: [
      'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1494905998402-395d579af36f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    description: 'Feel the power and excitement of the Ford Mustang. This iconic American muscle car delivers thrilling performance and head-turning style.',
    averageRating: 4.6,
    reviewCount: 29,
    availability: true
  },
  {
    _id: 'car5',
    brand: 'Jeep',
    model: 'Wrangler',
    year: 2023,
    type: 'SUV',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 95,
    mileage: '22 mpg',
    features: [
      '4x4 Capability',
      'Removable Top',
      'Off-Road Tires',
      'Bluetooth',
      'Navigation System',
      'Tow Package'
    ],
    images: [
      'https://cdn.pixabay.com/photo/2016/11/18/12/51/jeep-1834086_1280.jpg',
      'https://cdn.pixabay.com/photo/2018/02/21/03/15/jeep-wrangler-3169359_1280.jpg'
    ],
    description: 'Adventure awaits with the Jeep Wrangler. Built for off-road exploration, this rugged SUV lets you experience the great outdoors like never before.',
    averageRating: 4.4,
    reviewCount: 33,
    availability: true
  },
  {
    _id: 'car6',
    brand: 'BMW',
    model: '5 Series',
    year: 2023,
    type: 'Luxury',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    seatingCapacity: 5,
    pricePerDay: 150,
    mileage: '28 mpg',
    features: [
      'Leather Interior',
      'Panoramic Sunroof',
      'Premium Sound System',
      'Adaptive Cruise Control',
      'Heated & Cooled Seats',
      'Parking Assistant'
    ],
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    ],
    description: 'Experience luxury and performance with the BMW 5 Series. This elegant sedan combines sophisticated styling with advanced technology and dynamic driving characteristics.',
    averageRating: 4.8,
    reviewCount: 45,
    availability: true
  }
];

// 6 Users with different roles
export const users = [
  {
    _id: 'user1',
    name: 'John Admin',
    email: 'admin@example.com',
    role: 'admin',
    phone: '123-456-7890',
    address: '123 Admin St, City, State, 12345',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    createdAt: '2023-01-15T10:00:00.000Z',
    lastLogin: '2023-06-10T14:30:00.000Z'
  },
  {
    _id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    phone: '234-567-8901',
    address: '456 User Ave, City, State, 23456',
    profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    createdAt: '2023-02-20T11:15:00.000Z',
    lastLogin: '2023-06-09T09:45:00.000Z'
  },
  {
    _id: 'user3',
    name: 'Robert Johnson',
    email: 'robert@example.com',
    role: 'user',
    phone: '345-678-9012',
    address: '789 Customer Blvd, City, State, 34567',
    profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
    createdAt: '2023-03-05T14:20:00.000Z',
    lastLogin: '2023-06-08T16:10:00.000Z'
  },
  {
    _id: 'user4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'user',
    phone: '456-789-0123',
    address: '101 Renter St, City, State, 45678',
    profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
    createdAt: '2023-03-15T09:30:00.000Z',
    lastLogin: '2023-06-07T11:25:00.000Z'
  },
  {
    _id: 'user5',
    name: 'Michael Wilson',
    email: 'michael@example.com',
    role: 'user',
    phone: '567-890-1234',
    address: '202 Driver Rd, City, State, 56789',
    profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
    createdAt: '2023-04-10T13:45:00.000Z',
    lastLogin: '2023-06-06T15:50:00.000Z'
  },
  {
    _id: 'user6',
    name: 'Sarah Brown',
    email: 'sarah@example.com',
    role: 'user',
    phone: '678-901-2345',
    address: '303 Client Ln, City, State, 67890',
    profileImage: 'https://randomuser.me/api/portraits/women/6.jpg',
    createdAt: '2023-05-05T10:10:00.000Z',
    lastLogin: '2023-06-05T12:15:00.000Z'
  }
];

// 6 Bookings with different statuses
export const bookings = [
  {
    _id: 'booking1',
    user: users[1],
    car: cars[0],
    startDate: '2023-06-15T10:00:00.000Z',
    endDate: '2023-06-20T10:00:00.000Z',
    totalAmount: 375,
    bookingStatus: 'Active',
    paymentStatus: 'Completed',
    createdAt: '2023-06-01T14:30:00.000Z'
  },
  {
    _id: 'booking2',
    user: users[2],
    car: cars[1],
    startDate: '2023-06-18T10:00:00.000Z',
    endDate: '2023-06-25T10:00:00.000Z',
    totalAmount: 595,
    bookingStatus: 'Active',
    paymentStatus: 'Completed',
    createdAt: '2023-06-02T11:45:00.000Z'
  },
  {
    _id: 'booking3',
    user: users[3],
    car: cars[2],
    startDate: '2023-07-01T10:00:00.000Z',
    endDate: '2023-07-05T10:00:00.000Z',
    totalAmount: 480,
    bookingStatus: 'Pending',
    paymentStatus: 'Pending',
    createdAt: '2023-06-03T09:15:00.000Z'
  },
  {
    _id: 'booking4',
    user: users[4],
    car: cars[3],
    startDate: '2023-05-10T10:00:00.000Z',
    endDate: '2023-05-15T10:00:00.000Z',
    totalAmount: 550,
    bookingStatus: 'Completed',
    paymentStatus: 'Completed',
    createdAt: '2023-05-01T16:20:00.000Z'
  },
  {
    _id: 'booking5',
    user: users[5],
    car: cars[4],
    startDate: '2023-05-20T10:00:00.000Z',
    endDate: '2023-05-25T10:00:00.000Z',
    totalAmount: 475,
    bookingStatus: 'Completed',
    paymentStatus: 'Completed',
    createdAt: '2023-05-10T13:10:00.000Z'
  },
  {
    _id: 'booking6',
    user: users[1],
    car: cars[5],
    startDate: '2023-07-10T10:00:00.000Z',
    endDate: '2023-07-15T10:00:00.000Z',
    totalAmount: 750,
    bookingStatus: 'Pending',
    paymentStatus: 'Pending',
    createdAt: '2023-06-05T10:30:00.000Z'
  }
];

// 6 Reviews for different cars
export const reviews = [
  {
    _id: 'review1',
    user: users[1],
    car: cars[0],
    rating: 5,
    comment: 'Excellent car! Very comfortable and fuel-efficient. Would definitely rent again.',
    createdAt: '2023-05-25T14:30:00.000Z'
  },
  {
    _id: 'review2',
    user: users[2],
    car: cars[1],
    rating: 4,
    comment: 'Great SUV with plenty of space. The all-wheel drive was perfect for our trip to the mountains.',
    createdAt: '2023-05-28T11:45:00.000Z'
  },
  {
    _id: 'review3',
    user: users[3],
    car: cars[2],
    rating: 5,
    comment: 'Amazing experience with the Tesla! The autopilot feature made highway driving a breeze.',
    createdAt: '2023-06-02T09:15:00.000Z'
  },
  {
    _id: 'review4',
    user: users[4],
    car: cars[3],
    rating: 4,
    comment: 'The Mustang was a blast to drive! Powerful engine and great handling.',
    createdAt: '2023-05-18T16:20:00.000Z'
  },
  {
    _id: 'review5',
    user: users[5],
    car: cars[4],
    rating: 4,
    comment: 'Perfect vehicle for our off-road adventure. The Jeep handled everything we threw at it.',
    createdAt: '2023-05-28T13:10:00.000Z'
  },
  {
    _id: 'review6',
    user: users[1],
    car: cars[5],
    rating: 5,
    comment: 'Luxury at its finest! The BMW was comfortable, powerful, and loaded with features.',
    createdAt: '2023-06-01T10:30:00.000Z'
  }
];

// Analytics data for admin dashboard
export const analytics = {
  totalUsers: 6,
  totalCars: 6,
  totalBookings: 6,
  totalRevenue: 3225,
  bookingsByStatus: {
    Active: 2,
    Pending: 2,
    Completed: 2,
    Cancelled: 0
  },
  popularCars: [
    { ...cars[2], bookingCount: 12 },
    { ...cars[5], bookingCount: 10 },
    { ...cars[0], bookingCount: 8 },
    { ...cars[3], bookingCount: 7 },
    { ...cars[1], bookingCount: 6 },
    { ...cars[4], bookingCount: 5 }
  ],
  revenueByMonth: [
    { month: 'Jan', revenue: 1200 },
    { month: 'Feb', revenue: 1500 },
    { month: 'Mar', revenue: 1800 },
    { month: 'Apr', revenue: 2200 },
    { month: 'May', revenue: 2500 },
    { month: 'Jun', revenue: 3000 }
  ]
};

// Car types for filtering
export const carTypes = [
  'Sedan',
  'SUV',
  'Electric',
  'Sports',
  'Luxury',
  'Compact',
  'Convertible',
  'Van'
];

// Car brands for filtering
export const carBrands = [
  'Toyota',
  'Honda',
  'Tesla',
  'Ford',
  'Jeep',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Chevrolet',
  'Nissan'
];

// Fuel types for filtering
export const fuelTypes = [
  'Gasoline',
  'Petrol',
  'Diesel',
  'Electric',
  'Hybrid',
  'Plug-in Hybrid'
];

// Transmission types for filtering
export const transmissionTypes = [
  'Automatic',
  'Manual',
  'Semi-Automatic'
];

// Export all data
const seedData = {
  cars,
  users,
  bookings,
  reviews,
  analytics,
  carTypes,
  carBrands,
  fuelTypes,
  transmissionTypes
};

export default seedData;
