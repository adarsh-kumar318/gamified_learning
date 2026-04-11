const router = require('express').Router();
const User = require('../models/User');
const XPLog = require('../models/XPLog');
const { protect } = require('../middleware/auth');
const { evaluateBadges } = require('../utils/badgeEngine');
const { calcLevel } = require('../utils/xpEngine');

// GET /api/profile/:id (Legacy - Clerk now uses /api/auth/me)
router.get('/:id', protect, async (req, res) => {
  try {
    // Return req.user which is already synced/found by clerkId in protect middleware
    res.json(req.user.toPublic());
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/profile/avatar
router.patch('/avatar', protect, async (req, res) => {
  try {
    const { avatarId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { avatarId } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error updating avatar.' });
  }
});

// POST /api/profile/sync-quest (New Clerk-friendly atomic update)
router.post('/sync-quest', protect, async (req, res) => {
  try {
    const { questId, pathId } = req.body;
    const user = req.user;

    // 1. Dedup: Check if already completed
    if (user.completedQuests.find(q => q.id === questId)) {
      return res.json(user.toPublic());
    }

    // 2. Look up quest for official rewards
    const Quest = require('../models/Quest');
    const quest = await Quest.findOne({ id: questId });
    
    if (!quest) {
      return res.status(404).json({ error: 'Quest not found.' });
    }

    // 3. Update stats (Server-side calculation)
    const oldXp = user.xp;
    user.xp += quest.xp;
    user.coins += quest.coins;
    user.totalCoins += quest.coins;
    user.level = calcLevel(user.xp);
    user.totalQuestsCompleted = (user.totalQuestsCompleted || 0) + 1;
    user.completedQuests.push({ id: questId, pathId, completedAt: new Date() });

    // 4. Update weekly XP
    const day = new Date().getDay();
    const newWeeklyXp = [...(user.weeklyXp || [0,0,0,0,0,0,0])];
    newWeeklyXp[day] = (newWeeklyXp[day] || 0) + quest.xp;
    user.weeklyXp = newWeeklyXp;

    // 5. Check badges
    const freshBadges = evaluateBadges(user.toObject());
    freshBadges.forEach(b => {
      if (!user.earnedBadges.includes(b)) user.earnedBadges.push(b);
    });

    await user.save();

    // 6. Log XP and notify
    await XPLog.create({ userId: user._id, amount: quest.xp, source: 'quest', sourceId: questId });
    
    const io = req.app.get('io');
    if (io && user.level > calcLevel(oldXp)) {
      io.to(`user_${user._id}`).emit('level_up', { newLevel: user.level, userId: user._id });
    }

    res.json(user.toPublic());
  } catch (err) {
    console.error('Quest Sync Error:', err);
    res.status(500).json({ error: 'Server error during quest sync.' });
  }
});

// GET /api/profile/leaderboard/top (Legacy)
router.get('/leaderboard/top', async (_req, res) => {
  try {
    const users = await User.find({}, 'username uid avatarId xp level streak').sort({ xp: -1 }).limit(10).lean();
    const lb = users.map((u, i) => ({ ...u, rank: i + 1, level: calcLevel(u.xp) }));
    res.json(lb);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
