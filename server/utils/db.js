// utils/db.js — Replaced by Firebase
const { db } = require('./firebase');

const connectDB = async () => {
  try {
    // Just verifying firestore is accessible
    await db.collection('_system_').doc('ping').set({ lastPing: new Date() });
    console.log('✅ Firestore connected successfully');
  } catch (err) {
    console.error('❌ Firestore connection error! Check your credentials.');
    console.error(`Message: ${err.message}`);
  }
};

module.exports = connectDB;
