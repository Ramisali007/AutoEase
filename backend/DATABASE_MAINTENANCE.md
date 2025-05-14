# AutoEase Database Maintenance Guide

This guide provides instructions on how to check the database status, fix common issues, and maintain the database for optimal performance.

## Table of Contents
1. [Checking Database Status](#checking-database-status)
2. [Fixing Common Issues](#fixing-common-issues)
3. [Database Optimization](#database-optimization)
4. [Performance Testing](#performance-testing)
5. [Maintenance Scripts](#maintenance-scripts)

## Checking Database Status

### Using the API Endpoint

The application provides a built-in API endpoint to check the database status:

```bash
curl http://localhost:5000/api/db-status
```

This will return a JSON response with information about the database connection, collections, and document counts.

### Using the Database Status Component

The frontend includes a Database Status component that displays the database connection status and collection statistics. You can access it at:

```
http://localhost:3000/admin/database
```

### Using the Check Database Script

Run the following command to check the database status and view sample data:

```bash
node checkDatabase.js
```

This script will display information about users, cars, bookings, and reviews in the database.

## Fixing Common Issues

### Orphaned Bookings

If you encounter issues with bookings referencing non-existent cars or users, run the following script:

```bash
node fixBookings.js
```

This script will identify and fix orphaned bookings by either deleting them or updating their references.

### Database Integrity Check

To check the overall integrity of the database, run:

```bash
node checkDatabaseIntegrity.js
```

This script checks for:
- Orphaned bookings (bookings with non-existent cars or users)
- Orphaned reviews (reviews with non-existent cars, users, or bookings)
- Car rating consistency
- Chat message integrity
- Notification integrity

## Database Optimization

### Optimizing Indexes

To optimize database indexes for better performance, run:

```bash
node optimizeIndexes.js
```

This script creates appropriate indexes for all collections to improve query performance.

### Making All Cars Available

If you need to reset all cars to available status, run:

```bash
node makeAllCarsAvailable.js
```

## Performance Testing

### Testing Database Performance

To test the database connection and query performance, run:

```bash
node checkDatabasePerformance.js
```

This script measures:
- Connection speed
- Query performance for different collections
- Complex query performance

## Maintenance Scripts

### Data Storage Test

To test if data is being stored correctly in the database, run:

```bash
node testDataStorage.js
```

This script creates test entries in all collections, verifies they can be retrieved, and then cleans them up.

### Seeding the Database

To populate the database with sample data, run:

```bash
npm run seed
```

Or for specific collections:

```bash
npm run seed:cars    # Seed only cars
npm run seed:all     # Seed all collections
npm run seed:delete  # Delete all seed data
```

## Troubleshooting

### Connection Issues

If you're having trouble connecting to the database:

1. Make sure MongoDB is running:
   ```bash
   mongod --version
   ```

2. Check if the MongoDB service is running:
   ```bash
   # On Windows
   sc query mongodb
   
   # On Linux
   systemctl status mongodb
   ```

3. Verify the connection string in `.env` file:
   ```
   MONGODB_URL=mongodb://127.0.0.1:27017/autoease
   ```

### Data Integrity Issues

If you notice data integrity issues:

1. Run the database integrity check:
   ```bash
   node checkDatabaseIntegrity.js
   ```

2. Fix orphaned bookings:
   ```bash
   node fixBookings.js
   ```

3. If necessary, reset and reseed the database:
   ```bash
   npm run seed:delete
   npm run seed:all
   ```

## Regular Maintenance Tasks

For optimal performance, perform these maintenance tasks regularly:

1. Check database status weekly:
   ```bash
   node checkDatabase.js
   ```

2. Optimize indexes monthly:
   ```bash
   node optimizeIndexes.js
   ```

3. Check database integrity monthly:
   ```bash
   node checkDatabaseIntegrity.js
   ```

4. Test database performance quarterly:
   ```bash
   node checkDatabasePerformance.js
   ```

5. Backup the database regularly:
   ```bash
   # Example using mongodump
   mongodump --db autoease --out ./backups/$(date +%Y-%m-%d)
   ```
