const router = require('express').Router();
const Match = require('../models/Match');
const { protect } = require('../middleware/auth');

// GET /api/battles/history
// Get recent matches for the current user
router.get('/history', protect, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [{ player1: req.user._id }, { player2: req.user._id }]
    })
    .populate('player1 player2 winner', 'username avatarId')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch match history.' });
  }
});

module.exports = router;
