// controllers/streakController.js
const { db } = require('../utils/firebase');
const { toPublic } = require('../models/User');
const { streakMultiplier } = require('../utils/xpEngine');

const todayStr    = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);

// POST /api/streaks/checkin
const checkIn = async (req, res) => {
  try {
    const userRef = db.collection('users').doc(req.user._id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    let user = { _id: userDoc.id, ...userDoc.data() };

    const today = todayStr();
    const yest  = yesterdayStr();

    if (user.lastActiveDate === today) {
      return res.json({ message: 'Already checked in today!', streak: user.streak, user: toPublic(user) });
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
    
    // For arrays in Firestore we map directly
    const day      = new Date().getDay();
    if (!user.weeklyXp) user.weeklyXp = [0,0,0,0,0,0,0];
    user.weeklyXp[day] = (user.weeklyXp[day] || 0) + bonusXp;

    await userRef.update(user);
    
    await db.collection('xplogs').doc().set({
      userId: user._id, 
      amount: bonusXp, 
      source: 'streak', 
      note: `Day ${user.streak} streak`,
      createdAt: new Date().toISOString()
    });

    res.json({ message: `Day ${user.streak} streak! +${bonusXp} XP`, streak: user.streak, bonusXp, user: toPublic(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Check-in failed.' });
  }
};

// GET /api/streaks/status
const streakStatus = async (req, res) => {
  try {
    const user = req.user; // from auth middleware
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
