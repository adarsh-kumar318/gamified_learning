// controllers/leaderboardController.js
const User = require('../models/User');
const { calcLevel } = require('../utils/xpEngine');

// GET /api/leaderboard  — Global top 100
const globalLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}, 'username avatarId xp level streak')
      .sort({ xp: -1 })
      .limit(100)
      .lean();
    const lb = users.map((u, i) => ({ ...u, rank: i + 1, level: calcLevel(u.xp) }));
    res.json(lb);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch leaderboard.' });
  }
};

// GET /api/leaderboard/weekly
const weeklyLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}, 'username avatarId xp level weeklyXp streak').lean();
    const lb = users
      .map(u => ({
        ...u,
        weeklyTotal: (u.weeklyXp || []).reduce((a, b) => a + b, 0),
        level: calcLevel(u.xp),
      }))
      .sort((a, b) => b.weeklyTotal - a.weeklyTotal)
      .slice(0, 100)
      .map((u, i) => ({ ...u, rank: i + 1 }));
    res.json(lb);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch weekly leaderboard.' });
  }
};

module.exports = { globalLeaderboard, weeklyLeaderboard };
