# Postman Requests for AutoEase API

## 1. Login as Admin

### Request
- **Method**: POST
- **URL**: http://localhost:5000/api/auth/login
- **Headers**:
  - Content-Type: application/json
- **Body** (raw JSON):
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Expected Response
```json
{
  "_id": "user-id-here",
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "admin",
  "token": "your-jwt-token-here"
}
```

## 2. Get All Users (Admin Only)

### Request
- **Method**: GET
- **URL**: http://localhost:5000/api/admin/users
- **Headers**:
  - Authorization: Bearer your-jwt-token-here

### Expected Response
```json
[
  {
    "_id": "user-id-1",
    "name": "Admin User",
    "email": "admin@example.com",
    "phone": "1234567890",
    "address": "123 Admin Street",
    "driverLicense": "ADM123456",
    "role": "admin"
  },
  {
    "_id": "user-id-2",
    "name": "Regular User",
    "email": "user@example.com",
    "phone": "9876543210",
    "address": "456 User Avenue",
    "driverLicense": "USR789012",
    "role": "user"
  }
]
```

## Instructions

1. First, send the Login request to get your authentication token
2. Copy the token value from the response
3. In the Get All Users request, replace "your-jwt-token-here" with the actual token
4. Send the Get All Users request
