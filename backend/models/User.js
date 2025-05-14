// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  profileImage: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  driverLicense: {
    type: String,
    default: ''
  },
  documents: [{
    name: String,
    path: String,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  role: {
    type: String,
    enum: ['user', 'admin', 'host'],
    default: 'user'
  },
  // Host-specific fields
  hostBio: {
    type: String,
    default: ''
  },
  hostingExperience: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    default: 'Beginner'
  },
  preferredPaymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'PayPal', 'Credit Card'],
    default: 'Bank Transfer'
  },
  hostSetupComplete: {
    type: Boolean,
    default: false
  },
  settings: {
    language: {
      type: String,
      enum: ['english', 'spanish', 'french', 'german', 'chinese', 'japanese'],
      default: 'english'
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    appNotifications: {
      type: Boolean,
      default: true
    },
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    autoRenew: {
      type: Boolean,
      default: true
    },
    savePaymentInfo: {
      type: Boolean,
      default: true
    },
    defaultCurrency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
      default: 'USD'
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add this before creating the model
UserSchema.pre('save', async function(next) {
  // If this is the first user, make them an admin
  const userCount = await this.constructor.countDocuments();
  if (userCount === 0) {
    this.role = 'admin';
  }
  next();
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
