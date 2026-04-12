const bcrypt = require('bcryptjs');

const createDefaultUser = async (data) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = data.password ? await bcrypt.hash(data.password, salt) : null;

  return {
    username: data.username,
    email: data.email,
    password: hashedPassword, // Hashed
    uid: data.uid,
    avatarId: null,
    clerkId: data.clerkId || null,

    // Gamification
    xp: 0,
    coins: 0,
    totalCoins: 0,
    level: 1,

    // RPG Systems
    energy: 10,
    maxEnergy: 10,
    energyRefillAt: new Date().toISOString(),

    // Streak
    streak: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    longestStreak: 1,

    // Quests & progress
    completedQuests: [],
    totalQuestsCompleted: 0,
    perfectAnswers: 0,
    weeklyXp: [0, 0, 0, 0, 0, 0, 0],

    // Badges & Social
    earnedBadges: [],
    friends: [],
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

const matchPassword = async (enteredPassword, storedPassword) => {
  return await bcrypt.compare(enteredPassword, storedPassword);
};

// Returns a user object with energy calculation applied
const calculateEnergyRefill = (user) => {
  const REFILL_RATE_MS = 5 * 60 * 1000; // 5 minutes
  if (user.energy >= user.maxEnergy) {
    user.energyRefillAt = null;
    return user;
  }

  if (!user.energyRefillAt) {
    user.energyRefillAt = new Date(Date.now() + REFILL_RATE_MS).toISOString();
    return user;
  }

  const now = new Date();
  let refillAt = new Date(user.energyRefillAt);
  
  while (now >= refillAt && user.energy < user.maxEnergy) {
    user.energy += 1;
    refillAt = new Date(refillAt.getTime() + REFILL_RATE_MS);
  }

  if (user.energy >= user.maxEnergy) {
    user.energyRefillAt = null;
  } else {
    user.energyRefillAt = refillAt.toISOString();
  }
  return user;
};

const toPublic = (user) => {
  const obj = { ...user };
  delete obj.password;
  return obj;
};

module.exports = { createDefaultUser, matchPassword, calculateEnergyRefill, toPublic };
