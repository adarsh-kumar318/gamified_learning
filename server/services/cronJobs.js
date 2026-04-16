// services/cronJobs.js — Scheduled tasks
const cron = require('node-cron');
const User   = require('../models/User');

const cronJobs = () => {
  // Reset weekly XP every Sunday at midnight
  cron.schedule('0 0 * * 0', async () => {
    try {
      await User.updateMany({}, { $set: { weeklyXp: [0, 0, 0, 0, 0, 0, 0] } });
      console.log('✅ Weekly XP reset completed');
    } catch (err) {
      console.error('❌ Weekly XP reset failed:', err.message);
    }
  });

  // Reset streak for users who missed a day — runs daily at 1am
  cron.schedule('0 1 * * *', async () => {
    try {
      const today     = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      // Users who last logged in before yesterday — reset streak
      await User.updateMany(
        { lastActiveDate: { $lt: yesterday }, streak: { $gt: 0 } },
        { $set: { streak: 0 } }
      );
      console.log('✅ Streak reset for inactive users');
    } catch (err) {
      console.error('❌ Streak reset failed:', err.message);
    }
  });

  // Update global leaderboard ranks — runs every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const users = await User.find({}, '_id xp').sort({ xp: -1 });
      const ops   = users.map((u, i) => ({
        updateOne: { filter: { _id: u._id }, update: { $set: { globalRank: i + 1 } } }
      }));
      if (ops.length) await User.bulkWrite(ops);
    } catch (err) {
      console.error('❌ Rank refresh failed:', err.message);
    }
  });

  console.log('⏰ Cron jobs scheduled');
};

module.exports = cronJobs;
