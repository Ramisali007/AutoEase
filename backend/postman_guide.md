# Postman Guide for AutoEase API Admin Access

## Step 1: Login as Admin

1. Open Postman and create a new request
2. Set the request method to **POST**
3. Enter the URL: `http://localhost:5000/api/auth/login`
4. Go to the **Headers** tab and add:
   - Key: `Content-Type`
   - Value: `application/json`
5. Go to the **Body** tab
6. Select **raw** and choose **JSON** from the dropdown
7. Enter the following JSON:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```
8. Click **Send**
9. You should receive a response like this:
   ```json
   {
     "_id": "some-id-here",
     "name": "Admin User",
     "email": "admin@example.com",
     "role": "admin",
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```
10. **Copy the token** from the response (the long string after `"token": `)

## Step 2: Get All Users (Admin Only)

1. Create another new request in Postman
2. Set the request method to **GET**
3. Enter the URL: `http://localhost:5000/api/admin/users`
4. Go to the **Headers** tab and add:
   - Key: `Authorization`
   - Value: `Bearer your-copied-token-here` (replace "your-copied-token-here" with the token you copied from the login response)
5. Click **Send**
6. You should receive a response with an array of all users in the system:
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

## Troubleshooting

If you get an error response:

1. **401 Unauthorized**: Check that you've correctly copied the token and included the "Bearer " prefix
2. **403 Forbidden**: Make sure you're using an admin account token
3. **500 Server Error**: Check that your server is running properly

## Additional Admin Endpoints

You can also access these other admin endpoints using the same token:

- **GET** `http://localhost:5000/api/admin/bookings` - Get all bookings
- **GET** `http://localhost:5000/api/admin/analytics` - Get system analytics
- **POST** `http://localhost:5000/api/admin/cars` - Add a new car
- **PUT** `http://localhost:5000/api/admin/cars/:id` - Update a car
- **DELETE** `http://localhost:5000/api/admin/cars/:id` - Delete a car
- **DELETE** `http://localhost:5000/api/admin/users/:id` - Delete a user
