// controllers/leaderboardController.js
const { db } = require('../utils/firebase');
const { calcLevel } = require('../utils/xpEngine');

// GET /api/leaderboard  — Global top 100
const globalLeaderboard = async (req, res) => {
  try {
    const usersQuery = await db.collection('users')
      .orderBy('xp', 'desc')
      .limit(100)
      .get();
      
    const users = usersQuery.docs.map(doc => {
      const data = doc.data();
      return {
        _id: doc.id,
        username: data.username,
        avatarId: data.avatarId,
        xp: data.xp,
        level: data.level,
        streak: data.streak
      };
    });

    const lb = users.map((u, i) => ({ ...u, rank: i + 1, level: calcLevel(u.xp) }));
    res.json(lb);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch leaderboard.' });
  }
};

// GET /api/leaderboard/weekly
const weeklyLeaderboard = async (req, res) => {
  try {
    // For weekly, we fetch a bunch and sort in memory, since we can't do array aggregation in Firestore natively easily
    const usersQuery = await db.collection('users').limit(500).get();
    
    const users = usersQuery.docs.map(doc => {
      const data = doc.data();
      return {
        _id: doc.id,
        username: data.username,
        avatarId: data.avatarId,
        xp: data.xp || 0,
        level: data.level,
        streak: data.streak,
        weeklyXp: data.weeklyXp || []
      };
    });

    const lb = users
      .map(u => ({
        ...u,
        weeklyTotal: u.weeklyXp.reduce((a, b) => a + b, 0),
        level: calcLevel(u.xp),
      }))
      .sort((a, b) => b.weeklyTotal - a.weeklyTotal)
      .slice(0, 100)
      .map((u, i) => ({ ...u, rank: i + 1 }));
    res.json(lb);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch weekly leaderboard.' });
  }
};

module.exports = { globalLeaderboard, weeklyLeaderboard };
