const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

const createTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists');
      return;
    }
    
    // Create a test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      phone: '1234567890',
      address: '123 Test Street',
      driverLicense: 'TEST12345',
      role: 'user'
    });
    
    await user.save();
    console.log('Test user created successfully');
    
    // Create an admin user if it doesn't exist
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        phone: '0987654321',
        address: '456 Admin Avenue',
        driverLicense: 'ADMIN6789',
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
    
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB Disconnected');
  }
};

createTestUser();
