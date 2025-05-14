# AutoEase - Car Rental Platform

A modern full-stack car rental platform built with the **MERN stack** (MongoDB, Express, React, Node.js), featuring real-time chat, booking management, and admin tools.

![AutoEase Platform](https://via.placeholder.com/800x400?text=AutoEase+Car+Rental+Platform)

---

## 🚗 Key Features

### 👤 User Panel

* **Secure Authentication** with JWT
* **Advanced Car Search** with filters
* **Manage Bookings** and download **PDF Invoices**
* **Real-time Notifications** for status updates
* **Chat** with Hosts/Admins
* **Leave Reviews & Ratings**
* **User Dashboard** with booking history & profile settings

### 🚘 Host Dashboard

* **Add & Manage Car Listings** with multiple images
* **Monitor & Control Bookings** for their cars
* **Host Analytics Dashboard**
* **Chat** directly with renters

### 🛠️ Admin Panel

* **User, Car, and Booking Management**
* **System-Wide Analytics**
* **Manage Content** (reviews, messages, notifications)
* **Car Upload Access** similar to Hosts

### 🔧 Technical Highlights

* **Real-time Chat & Notifications** with Socket.IO
* **Google Maps Integration** for car locations
* **Secure File Uploads** for cars and user profiles
* **Mobile-Responsive UI**
* **Role-Based API Security**
* **Optimized MongoDB Performance**

---

## 🧱 Tech Stack

### Frontend

* **React 19**, **React Router 7**, **Bootstrap 5**
* **Axios**, **Socket.IO Client**, **FontAwesome**
* **Google Maps API**, **Date-fns**, **jsPDF**

### Backend

* **Node.js**, **Express 5**, **MongoDB**, **Mongoose 8**
* **Socket.IO**, **JWT**, **Multer**, **Bcrypt**
* **PDFKit**, **Nodemailer**

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AutoEase-Project
```

### 2. Configure Environment Variables

Create `.env` files in both `/backend` and `/frontend`:

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

### 3. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 4. Seed Sample Data

```bash
# From backend directory
npm run seed:all
```

### 5. Run the App

#### Option A: Using Script (Windows)

```bash
start-app.bat
```

#### Option B: Manual Start

```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm start
```

---

## 🗃️ MongoDB Collections

* **Users**: Profiles, roles, auth
* **Cars**: Listings, availability, images
* **Bookings**: Status, dates, payments
* **Reviews**: Ratings per car
* **Messages**: User-host-admin chat
* **Notifications**: Real-time alerts
* **Subscribers**: Newsletter
* **Contacts**: Contact form data

---

## 👥 User Roles

* **User**: Browse cars, book, review
* **Host**: List/manage cars, interact with users
* **Admin**: Full access and control

---

## 🧪 Test Accounts

| Role  | Email                                           | Password |
| ----- | ----------------------------------------------- | -------- |
| Admin | [admin@autoease.com](mailto:admin@autoease.com) | admin123 |
| Host  | [host@autoease.com](mailto:host@autoease.com)   | host123  |
| User  | [user@autoease.com](mailto:user@autoease.com)   | user123  |

---

## 🖼️ Screenshots

![Dashboard](https://via.placeholder.com/400x200?text=Dashboard)
![Car Listings](https://via.placeholder.com/400x200?text=Car+Listings)
![Booking Process](https://via.placeholder.com/400x200?text=Booking+Process)
![Admin Panel](https://via.placeholder.com/400x200?text=Admin+Panel)

---

## 🔄 Recent Updates

* Admin image upload for cars
* Live chat between users, hosts, admins
* Booking lifecycle status tracking
* Responsive UI enhancements
* PDF invoice feature

---

## 🤝 Contributing

Contributions are welcome! Submit a Pull Request to get started.

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 📬 Contact Us

📧 **Email**: [ramisali.k786@gmail.com](mailto:ramisali.k786@gmail.com)
