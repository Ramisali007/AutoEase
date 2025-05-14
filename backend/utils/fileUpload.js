const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/profile',
    './uploads/documents',
    './uploads/cars',
    './uploads/car-images'  // Add this directory as well for compatibility
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Call this function to ensure directories exist
createUploadDirs();

// Configure storage for profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/profile');
  },
  filename: (req, file, cb) => {
    // Use user ID + timestamp to ensure uniqueness
    const userId = req.user._id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${userId}-${timestamp}${ext}`);
  }
});

// Configure storage for documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/documents');
  },
  filename: (req, file, cb) => {
    // Use user ID + original filename + timestamp to ensure uniqueness
    const userId = req.user._id;
    const timestamp = Date.now();
    const filename = file.originalname.replace(/\s+/g, '-').toLowerCase();
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
    cb(null, `${userId}-${baseName}-${timestamp}${ext}`);
  }
});

// Configure storage for car images
const carImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/cars');
  },
  filename: (req, file, cb) => {
    // Use user ID + car ID (if available) + timestamp to ensure uniqueness
    const userId = req.user._id;
    const carId = req.params.id || 'new';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `car-${userId}-${carId}-${timestamp}${ext}`);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt|rtf|odt|xls|xlsx|csv|ppt|pptx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only document files are allowed!'), false);
  }
};

// Create multer upload instances
const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFilter
}).single('profileImage');

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: documentFilter
}).single('document');

// Multiple documents upload
const uploadDocuments = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: documentFilter
}).array('documents', 5); // Maximum 5 files

// Car image upload
const uploadCarImage = multer({
  storage: carImageStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: imageFilter
}).single('carImage');

// Multiple car images upload
const uploadCarImages = multer({
  storage: carImageStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit per file
  fileFilter: imageFilter
}).array('carImages', 10); // Maximum 10 images per car

// Middleware wrapper for profile image upload
const profileImageUpload = (req, res, next) => {
  uploadProfileImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      // An unknown error occurred
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    // Everything went fine
    next();
  });
};

// Middleware wrapper for document upload
const documentUpload = (req, res, next) => {
  uploadDocument(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// Middleware wrapper for multiple documents upload
const documentsUpload = (req, res, next) => {
  uploadDocuments(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

// Middleware wrapper for car image upload
const carImageUpload = (req, res, next) => {
  // Ensure uploads directory exists
  createUploadDirs();

  uploadCarImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error during car image upload:', err);
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      console.error('Error during car image upload:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Log successful upload
    if (req.file) {
      console.log(`Successfully uploaded car image: ${req.file.originalname} -> ${req.file.filename}`);
    } else {
      console.warn('No file was uploaded in carImageUpload middleware');
    }

    next();
  });
};

// Middleware wrapper for multiple car images upload
const carImagesUpload = (req, res, next) => {
  // Ensure uploads directory exists
  createUploadDirs();

  uploadCarImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error during car images upload:', err);
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      console.error('Error during car images upload:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Log successful upload
    if (req.files && req.files.length > 0) {
      console.log(`Successfully uploaded ${req.files.length} car images`);
      req.files.forEach((file, index) => {
        console.log(`File ${index + 1}: ${file.originalname} -> ${file.filename}`);
      });
    } else {
      console.warn('No files were uploaded in carImagesUpload middleware');
    }

    next();
  });
};

module.exports = {
  profileImageUpload,
  documentUpload,
  documentsUpload,
  carImageUpload,
  carImagesUpload
};
