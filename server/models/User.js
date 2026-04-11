const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username:    { type: String, required: true, unique: true, trim: true },
  email:       { type: String, required: true, unique: true, trim: true },
  password:    { type: String, required: true },
  uid:         { type: String, unique: true, sparse: true }, // Unique human-readable ID (#LVL-XXXXXX)
  avatarId:    { type: Number, default: null },
  clerkId:     { type: String, unique: true, sparse: true }, // Legacy Clerk support
  
  // Gamification
  xp:          { type: Number, default: 0 },
  coins:       { type: Number, default: 0 },
  totalCoins:  { type: Number, default: 0 },
  level:       { type: Number, default: 1 },

  // RPG Systems
  energy:          { type: Number, default: 10 },
  maxEnergy:       { type: Number, default: 10 },
  energyRefillAt:  { type: Date,   default: Date.now },

  // Streak
  streak:          { type: Number, default: 1 },
  lastActiveDate:  { type: String, default: '' },   // YYYY-MM-DD
  longestStreak:   { type: Number, default: 1 },

  // Quests & progress
  completedQuests: [{ id: String, pathId: String, completedAt: Date, percentage: Number }],
  totalQuestsCompleted: { type: Number, default: 0 },
  perfectAnswers:  { type: Number, default: 0 },
  weeklyXp:        { type: [Number], default: [0, 0, 0, 0, 0, 0, 0] },

  // Badges
  earnedBadges: { type: [String], default: [] },
  
  // Social
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Pre-save hook for password hashing
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Energy Refill Logic (Faster for Testing)
userSchema.methods.calculateEnergyRefill = function () {
  const REFILL_RATE_MS = 5 * 60 * 1000; // 5 minutes
  if (this.energy >= this.maxEnergy) {
    this.energyRefillAt = null;
    return;
  }

  if (!this.energyRefillAt) {
    this.energyRefillAt = new Date(Date.now() + REFILL_RATE_MS);
    return;
  }

  const now = new Date();
  while (now >= this.energyRefillAt && this.energy < this.maxEnergy) {
    this.energy += 1;
    this.energyRefillAt = new Date(this.energyRefillAt.getTime() + REFILL_RATE_MS);
  }

  if (this.energy >= this.maxEnergy) {
    this.energyRefillAt = null;
  }
};

// Hide password in JSON responses
userSchema.methods.toPublic = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
