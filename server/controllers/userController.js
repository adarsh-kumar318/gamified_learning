// controllers/userController.js
const User  = require('../models/User');
const XPLog = require('../models/XPLog');
const { calcLevel, calcLevelProgress, calcXpToNext } = require('../utils/xpEngine');

// GET /api/users/dashboard
const getDashboard = async (req, res) => {
  try {
    const user  = await User.findById(req.user._id);
    const level = calcLevel(user.xp);
    const recentXp = await XPLog.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10);

    res.json({
      user: user.toPublic(),
      level,
      levelProgress:  calcLevelProgress(user.xp),
      xpToNext:       calcXpToNext(user.xp),
      completedCount: user.completedQuests.length,
      recentXp,
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch dashboard.' });
  }
};

// GET /api/users/:id  (public profile)
const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    let user;
    
    // Check if id is a 24-char hex (ObjectId)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id).select('-password');
    } else {
      // Otherwise search by username
      user = await User.findOne({ username: id }).select('-password');
    }

    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// PATCH /api/users/me
const updateMe = async (req, res) => {
  try {
    const allowed = ['avatarId', 'email'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Could not update profile.' });
  }
};

// GET /api/users/me/xp-history
const xpHistory = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const logs  = await XPLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch XP history.' });
  }
};

// GET /api/users/me/quest-history
const questHistory = async (req, res) => {
  try {
    const user  = await User.findById(req.user._id);
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const total = user.completedQuests.length;
    const quests = [...user.completedQuests]
      .reverse()
      .slice((page - 1) * limit, page * limit);
    res.json({ quests, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch quest history.' });
  }
};

module.exports = { getDashboard, getProfile, updateMe, xpHistory, questHistory };
