const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/autoease', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB Connected');
  
  // List all collections
  mongoose.connection.db.listCollections().toArray()
    .then(collections => {
      console.log('Collections in database:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      // Count documents in each collection
      const promises = collections.map(collection => {
        return mongoose.connection.db.collection(collection.name).countDocuments()
          .then(count => {
            console.log(`${collection.name}: ${count} documents`);
          });
      });
      
      Promise.all(promises)
        .then(() => {
          console.log('Database check complete');
          mongoose.disconnect();
        });
    })
    .catch(err => {
      console.error('Error listing collections:', err);
      mongoose.disconnect();
    });
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
});
