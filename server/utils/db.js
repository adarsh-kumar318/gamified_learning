// utils/db.js — MongoDB connection
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('📡 Attempting MongoDB connection...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
    });
    console.log(`✅ MongoDB connected: ${conn.connection.name} @ ${conn.connection.host || 'localhost'}`);
  } catch (err) {
    console.error('❌ MongoDB connection error! Check your IP allowlist and credentials.');
    console.error(`Message: ${err.message}`);
    // We don't exit(1) anymore, so the API stays alive to report the issue
  }
};

module.exports = connectDB;
