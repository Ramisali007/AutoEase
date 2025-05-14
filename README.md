# AutoEase - Car Rental Platform

A modern, full-stack car rental application built with the MERN stack (MongoDB, Express, React, Node.js) featuring real-time notifications, chat functionality, and comprehensive booking management.

![AutoEase Platform](https://via.placeholder.com/800x400?text=AutoEase+Car+Rental+Platform)

## 🚗 Features

### User Features
- **User Authentication**: Secure registration and login with JWT
- **Car Browsing**: Advanced filtering and search capabilities
- **Booking Management**: Create, view, and manage bookings
- **Reviews & Ratings**: Leave and view car reviews
- **Real-time Chat**: Communicate with hosts and admins
- **Notifications**: Real-time updates on booking status changes
- **User Profile**: Manage personal information and view booking history
- **PDF Invoice Generation**: Download booking invoices

### Host Features
- **Car Management**: Add, edit, and manage car listings
- **Car Image Upload**: Upload multiple images for each car
- **Booking Oversight**: View and manage bookings for their cars
- **Host Dashboard**: Comprehensive analytics and management tools
- **Chat with Renters**: Direct communication with potential renters

### Admin Features
- **User Management**: View, edit, and manage all users
- **Car Administration**: Add, edit, and delete any car listing
- **Car Image Upload**: Upload car images just like hosts
- **Booking Management**: Oversee all bookings in the system
- **System Analytics**: View platform performance metrics
- **Content Management**: Manage reviews, messages, and notifications

### Technical Features
- **Real-time Communication**: Socket.IO integration for chat and notifications
- **Responsive Design**: Mobile-friendly interface
- **Google Maps Integration**: Location selection and visualization
- **Secure File Upload**: Image upload for cars and user profiles
- **Database Optimization**: Efficient MongoDB queries and indexing
- **API Security**: Protected routes with role-based access control

## 🛠️ Technology Stack

### Frontend
- **React 19**: Modern UI library with hooks and context API
- **React Router 7**: Client-side routing
- **Axios**: HTTP client for API requests
- **Socket.IO Client**: Real-time communication
- **Google Maps API**: Location services
- **FontAwesome**: Icon library
- **Bootstrap 5**: Responsive styling
- **Date-fns**: Date manipulation
- **jsPDF**: PDF generation

### Backend
- **Node.js**: JavaScript runtime
- **Express 5**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose 8**: MongoDB object modeling
- **Socket.IO**: Real-time bidirectional communication
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Multer**: File upload handling
- **Nodemailer**: Email services
- **PDFKit**: Server-side PDF generation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn
- Google Maps API key (for location features)

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd AutoEase-Project
```

### 2. Set up environment variables

Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/autoease
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. Install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Seed the database

```bash
# From the backend directory
npm run seed:all
```

This will populate the database with sample users, cars, bookings, and reviews.

### 5. Start the application

#### Using the provided script (Windows)

```bash
# From the root directory
start-app.bat
```

#### Manual start

```bash
# Start the backend server (from the backend directory)
npm run dev

# Start the frontend server (from the frontend directory)
npm start
```

## 📊 Database Structure

The application uses MongoDB with the following collections:

- **Users**: User accounts and profiles with role-based permissions
- **Cars**: Car listings with details, availability, and images
- **Bookings**: Rental bookings with dates, status, and payment information
- **Reviews**: User reviews and ratings for cars
- **Messages**: Chat messages between users, hosts, and admins
- **Notifications**: System notifications for users
- **Subscribers**: Newsletter subscribers
- **Contacts**: Contact form submissions

## 🔐 User Roles

- **User**: Can browse cars, make bookings, and leave reviews
- **Host**: Can list cars, manage their listings, and communicate with renters
- **Admin**: Full system access to manage users, cars, bookings, and content

## 👤 Default Accounts

### Admin Account
- Email: admin@autoease.com
- Password: admin123

### Host Account
- Email: host@autoease.com
- Password: host123

### User Account
- Email: user@autoease.com
- Password: user123

## 📱 Application Screenshots

![Dashboard](https://via.placeholder.com/400x200?text=Dashboard)
![Car Listings](https://via.placeholder.com/400x200?text=Car+Listings)
![Booking Process](https://via.placeholder.com/400x200?text=Booking+Process)
![Admin Panel](https://via.placeholder.com/400x200?text=Admin+Panel)

## 🔄 Recent Updates

- Added car image upload functionality for admins
- Implemented real-time chat between users, hosts, and admins
- Enhanced booking management with status tracking
- Improved user interface with responsive design
- Added PDF invoice generation for bookings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 📞 Contact

For any questions or support, please contact the development team at support@autoease.com.
