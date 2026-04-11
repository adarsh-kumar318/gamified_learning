const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
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

    if (await User.findOne({ username }))
      return res.status(400).json({ error: 'Username already taken.' });

    if (await User.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered.' });

    
    const user = await User.create({ 
      username, 
      email, 
      password, 
      uid: generateUID(),
      xp: 0,
      coins: 0,
      totalCoins: 0,
      level: 1,
      streak: 1,
      lastActiveDate: todayStr(),
      completedQuests: [],
      earnedBadges: []
    });

    const token = signToken(user._id);
    res.status(201).json({ user: user.toPublic(), token });
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

    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
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
    
    user.calculateEnergyRefill();
    
    // Check for badges (e.g. streaks) 🏆
    checkNewBadges(user);

    await user.save();

    const token = signToken(user._id);
    res.json({ user: user.toPublic(), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  // req.user is populated by protect middleware
  req.user.calculateEnergyRefill();
  await req.user.save();
  res.json(req.user.toPublic());
};

// PATCH /api/auth/avatar
const updateAvatar = async (req, res) => {
  try {
    const { avatarId } = req.body;
    req.user.avatarId = avatarId;
    await req.user.save();
    res.json(req.user.toPublic());
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
      await user.save();
      return res.json({ 
        message: "The Innkeeper takes pity on you. Rest well, hero! 🏮", 
        user: user.toPublic() 
      });
    }

    user.coins -= REFILL_COST;
    user.energy = 10;
    await user.save();

    res.json({ 
      message: "Zzz... You feel refreshed! Stamina restored. ⚡", 
      user: user.toPublic() 
    });
  } catch (err) {
    res.status(500).json({ error: "The Inn is fully booked! (Server error)" });
  }
};

module.exports = { register, login, getMe, updateAvatar, refillEnergy };
