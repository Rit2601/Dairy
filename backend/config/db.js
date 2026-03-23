const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not defined in environment variables');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Don't exit — let Render see the app is still running
    // It will retry on next request
  }
};

module.exports = connectDB;