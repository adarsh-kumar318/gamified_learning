require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('../models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leveluplearning';

async function refillEnergy() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB... 🏮');

    const result = await User.updateMany({}, { energy: 10, maxEnergy: 10 });
    console.log(`✅ Successfully refilled energy for ${result.modifiedCount} users.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error refilling energy:', err);
    process.exit(1);
  }
}

refillEnergy();
