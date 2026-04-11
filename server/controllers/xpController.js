// controllers/xpController.js
const XPLog = require('../models/XPLog');

// GET /api/xp/stats
const xpStats = async (req, res) => {
  try {
    const logs = await XPLog.find({ userId: req.user._id });
    const breakdown = {};
    logs.forEach(l => {
      breakdown[l.source] = (breakdown[l.source] || 0) + l.amount;
    });
    res.json({
      totalXp: req.user.xp,
      breakdown,
      recentEvents: logs.slice(-10).reverse(),
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch XP stats.' });
  }
};

module.exports = { xpStats };
