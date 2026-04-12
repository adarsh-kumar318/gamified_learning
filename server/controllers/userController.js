// controllers/userController.js
const { db } = require('../utils/firebase');
const { toPublic } = require('../models/User');
const { calcLevel, calcLevelProgress, calcXpToNext } = require('../utils/xpEngine');

// GET /api/users/dashboard
const getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const level = calcLevel(user.xp);
    
    // Fetch recent XP logs for the dashboard
    const xpQuery = await db.collection('xplogs')
      .where('userId', '==', user._id)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const recentXp = xpQuery.docs.map(d => ({ _id: d.id, ...d.data() }));

    res.json({
      user: toPublic(user),
      level,
      levelProgress:  calcLevelProgress(user.xp),
      xpToNext:       calcXpToNext(user.xp),
      completedCount: (user.completedQuests || []).length,
      recentXp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch dashboard.' });
  }
};

// GET /api/users/:id  (public profile)
const getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    let userDoc;

    if (id.length > 15) { // Assuming document ids are long strings like object ids
      userDoc = await db.collection('users').doc(id).get();
      if (!userDoc.exists) {
        // Try searching by username just in case
        const nameQuery = await db.collection('users').where('username', '==', id).limit(1).get();
        if (!nameQuery.empty) userDoc = nameQuery.docs[0];
      }
    } else {
      const nameQuery = await db.collection('users').where('username', '==', id).limit(1).get();
      if (!nameQuery.empty) userDoc = nameQuery.docs[0];
    }

    if (!userDoc || !userDoc.exists) return res.status(404).json({ error: 'User not found.' });

    const publicUser = toPublic({ _id: userDoc.id, ...userDoc.data() });
    res.json(publicUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PATCH /api/users/me
const updateMe = async (req, res) => {
  try {
    const allowed = ['avatarId', 'email'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    
    if (Object.keys(updates).length > 0) {
      await db.collection('users').doc(req.user._id).update(updates);
      // update the current object so we can return it
      Object.assign(req.user, updates);
    }
    
    res.json(toPublic(req.user));
  } catch (err) {
    res.status(500).json({ error: 'Could not update profile.' });
  }
};

// GET /api/users/me/xp-history
const xpHistory = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limitParams = parseInt(req.query.limit) || 20;

    // In Firestore, pagination is typically done via cursor (startAfter). 
    // To keep it simple for now, we just fetch a larger batch and slice, or implement offset (which Firestore supports).
    const logsQuery = await db.collection('xplogs')
      .where('userId', '==', req.user._id)
      .orderBy('createdAt', 'desc')
      .offset((page - 1) * limitParams)
      .limit(limitParams)
      .get();

    const logs = logsQuery.docs.map(d => ({ _id: d.id, ...d.data() }));
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch XP history.' });
  }
};

// GET /api/users/me/quest-history
const questHistory = async (req, res) => {
  try {
    const user = req.user;
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const total = (user.completedQuests || []).length;
    const quests = [...(user.completedQuests || [])]
      .reverse()
      .slice((page - 1) * limit, page * limit);
    res.json({ quests, total, page, limit });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch quest history.' });
  }
};

module.exports = { getDashboard, getProfile, updateMe, xpHistory, questHistory };
