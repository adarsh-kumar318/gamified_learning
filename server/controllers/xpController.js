// controllers/xpController.js
const { db } = require('../utils/firebase');

// GET /api/xp/stats
const xpStats = async (req, res) => {
  try {
    const logsQuery = await db.collection('xplogs')
      .where('userId', '==', req.user._id)
      .get();
      
    const logs = logsQuery.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    
    const breakdown = {};
    logs.forEach(l => {
      breakdown[l.source] = (breakdown[l.source] || 0) + l.amount;
    });

    // To get the recent events, sort logs programmatically or use an orderBy query
    const sortedLogs = [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      totalXp: req.user.xp,
      breakdown,
      recentEvents: sortedLogs.slice(0, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch XP stats.' });
  }
};

module.exports = { xpStats };
