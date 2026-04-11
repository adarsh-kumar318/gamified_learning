// controllers/badgeController.js
const { BADGE_DEFS } = require('../utils/badgeEngine');

// GET /api/badges
const getBadges = async (req, res) => {
  const earned = new Set(req.user.earnedBadges || []);
  const badges = BADGE_DEFS.map(b => ({
    ...b,
    earned: earned.has(b.id),
    condition: undefined,   // don't expose JS function
  }));
  res.json(badges);
};

module.exports = { getBadges };
