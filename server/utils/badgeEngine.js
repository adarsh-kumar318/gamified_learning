// server/utils/badgeEngine.js

/**
 * Defines Badge conditions (must match frontend definition IDs)
 */
const BADGE_DEFINITIONS = [
  { id: "first_step", name: "Baby Steps", condition: (u) => u.totalQuestsCompleted >= 1 || u.perfectAnswers >= 1 },
  { id: "first_quest", name: "Quest Starter", condition: (u) => u.totalQuestsCompleted >= 1 },
  { id: "xp100", name: "Century Club", condition: (u) => u.xp >= 100 },
  { id: "xp500", name: "XP Hunter", condition: (u) => u.xp >= 500 },
  { id: "streak3", name: "On Fire", condition: (u) => u.streak >= 3 },
  { id: "level5", name: "Rising Star", condition: (u) => u.level >= 5 },
  { id: "wealthy_start", name: "Pocket Change", condition: (u) => u.totalCoins >= 50 },
  { id: "perfect", name: "Perfectionist", condition: (u) => u.perfectAnswers >= 5 },
];

/**
 * Evaluates user performance and returns NEWLY unlocked badges
 * @param {Object} user - The user document
 * @returns {Array<Object>} - List of newly earned badge IDs and names
 */
const checkNewBadges = (user) => {
  const newlyUnlocked = [];
  
  for (const badge of BADGE_DEFINITIONS) {
    // If user doesn't have it, and meets condition
    if (!user.earnedBadges.includes(badge.id)) {
      if (badge.condition(user)) {
        newlyUnlocked.push({ id: badge.id, name: badge.name });
        user.earnedBadges.push(badge.id);
      }
    }
  }

  return newlyUnlocked;
};

module.exports = { checkNewBadges, BADGE_DEFINITIONS };
