// controllers/streakController.js
const User  = require('../models/User');
const XPLog = require('../models/XPLog');
const { streakMultiplier } = require('../utils/xpEngine');

const todayStr    = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);

// POST /api/streaks/checkin
const checkIn = async (req, res) => {
  try {
    const user  = await User.findById(req.user._id);
    const today = todayStr();
    const yest  = yesterdayStr();

    if (user.lastActiveDate === today) {
      return res.json({ message: 'Already checked in today!', streak: user.streak, user: user.toPublic() });
    }

    if (user.lastActiveDate === yest) {
      user.streak++;
      if (user.streak > (user.longestStreak || 1)) user.longestStreak = user.streak;
    } else {
      user.streak = 1;
    }

    user.lastActiveDate = today;

    // Streak bonus XP
    const mult     = streakMultiplier(user.streak);
    const bonusXp  = Math.round(20 * mult);
    user.xp       += bonusXp;
    const day      = new Date().getDay();
    user.weeklyXp[day] = (user.weeklyXp[day] || 0) + bonusXp;

    await user.save();
    await XPLog.create({ userId: user._id, amount: bonusXp, source: 'streak', note: `Day ${user.streak} streak` });

    res.json({ message: `Day ${user.streak} streak! +${bonusXp} XP`, streak: user.streak, bonusXp, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ error: 'Check-in failed.' });
  }
};

// GET /api/streaks/status
const streakStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      streak:        user.streak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
      multiplier:    streakMultiplier(user.streak),
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch streak status.' });
  }
};

module.exports = { checkIn, streakStatus };
