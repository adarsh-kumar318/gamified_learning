// middleware/auth.js — Manual JWT Authentication middleware
const jwt = require('jsonwebtoken');
const { db } = require('../utils/firebase');
const { calculateEnergyRefill } = require('../models/User');

const generateUID = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
  let res = '#LVL-';
  for (let i = 0; i < 8; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from DB
      const userRef = db.collection('users').doc(decoded.id);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        return res.status(401).json({ error: 'User not found. Please login again.' });
      }

      let user = { _id: userDoc.id, ...userDoc.data() };

      let updated = false;

      // ── UID Migration (Assign if missing) ───────────────────────────────────
      if (!user.uid) {
        user.uid = generateUID();
        updated = true;
        console.log(`🔨 Assigned new UID [${user.uid}] to user: ${user.username}`);
      }

      // ── Energy Refill Logic ───────────────────────────────────────────────
      const energyBefore = user.energy;
      user = calculateEnergyRefill(user);
      if (user.energy !== energyBefore || user.energyRefillAt) {
        updated = true;
      }

      if (updated) {
        await userRef.update(user);
      }

      req.user = user;
      next();
    } catch (err) {
      console.error('❌ Token Verification Error:', err.message);
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

module.exports = { protect, generateUID };
