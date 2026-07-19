const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('FATAL: MONGO_URI is not defined in environment variables');
      console.error('Make sure you have a .env file in the backend directory with MONGO_URI set');
      process.exit(1);
    }

    console.log(`Attempting MongoDB connection to: ${uri}`);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error details:');
    console.error(`  Error name: ${error.name}`);
    console.error(`  Error message: ${error.message}`);
    if (error.name === 'MongooseServerSelectionError') {
      console.error('  TIP: Ensure MongoDB is running on your machine.');
      console.error('  TIP: Verify the MONGO_URI in your .env file is correct.');
      console.error('  TIP: Try: mongosh "mongodb://localhost:27017" to test connectivity.');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
