const jwt    = require('jsonwebtoken');
const { createDefaultUser, matchPassword, calculateEnergyRefill, toPublic } = require('../models/User');
const { db } = require('../utils/firebase');
const { generateUID } = require('../middleware/auth');
const { checkNewBadges } = require('../utils/badgeEngine');

const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !password || !email)
      return res.status(400).json({ error: 'Username, email and password are required.' });

    const usernameQuery = await db.collection('users').where('username', '==', username).limit(1).get();
    if (!usernameQuery.empty)
      return res.status(400).json({ error: 'Username already taken.' });

    const emailQuery = await db.collection('users').where('email', '==', email).limit(1).get();
    if (!emailQuery.empty)
      return res.status(400).json({ error: 'Email already registered.' });

    const userObj = await createDefaultUser({ 
      username, 
      email, 
      password, 
      uid: generateUID()
    });

    const userRef = db.collection('users').doc();
    userObj._id = userRef.id;
    await userRef.set(userObj);

    const token = signToken(userRef.id);
    res.status(201).json({ user: toPublic(userObj), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password are required.' });

    const userQuery = await db.collection('users').where('username', '==', username).limit(1).get();
    if (userQuery.empty) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const userDoc = userQuery.docs[0];
    let user = { _id: userDoc.id, ...userDoc.data() };

    if (!(await matchPassword(password, user.password))) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // Streak & Energy logic
    const today = todayStr();
    const yest  = yesterday();
    if (user.lastActiveDate === yest) {
      user.streak = (user.streak || 1) + 1;
      if (user.streak > (user.longestStreak || 1)) user.longestStreak = user.streak;
    } else if (user.lastActiveDate !== today) {
      user.streak = 1;
    }
    user.lastActiveDate = today;
    
    user = calculateEnergyRefill(user);
    
    // Check for badges (e.g. streaks) 🏆
    checkNewBadges(user);

    await db.collection('users').doc(user._id).update(user);

    const token = signToken(user._id);
    res.json({ user: toPublic(user), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  let user = calculateEnergyRefill(req.user);
  await db.collection('users').doc(user._id).update(user);
  res.json(toPublic(user));
};

// PATCH /api/auth/avatar
const updateAvatar = async (req, res) => {
  try {
    const { avatarId } = req.body;
    let user = req.user;
    user.avatarId = avatarId;
    await db.collection('users').doc(user._id).update({ avatarId });
    res.json(toPublic(user));
  } catch (err) {
    res.status(500).json({ error: 'Could not update avatar.' });
  }
};

// POST /api/auth/refill
const refillEnergy = async (req, res) => {
  try {
    const user = req.user;
    const REFILL_COST = 10;

    if (user.energy >= 10) {
      return res.status(400).json({ error: "Your stamina is already at its peak! 🛡️" });
    }

    if (user.coins < REFILL_COST) {
      // Pity refill for dev/low coins
      user.energy = 10;
      await db.collection('users').doc(user._id).update({ energy: 10 });
      return res.json({ 
        message: "The Innkeeper takes pity on you. Rest well, hero! 🏮", 
        user: toPublic(user) 
      });
    }

    user.coins -= REFILL_COST;
    user.energy = 10;
    await db.collection('users').doc(user._id).update({ 
      coins: user.coins, 
      energy: user.energy 
    });

    res.json({ 
      message: "Zzz... You feel refreshed! Stamina restored. ⚡", 
      user: toPublic(user) 
    });
  } catch (err) {
    res.status(500).json({ error: "The Inn is fully booked! (Server error)" });
  }
};

module.exports = { register, login, getMe, updateAvatar, refillEnergy };
