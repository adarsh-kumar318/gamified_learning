// utils/xpEngine.js — XP / level calculation logic

const XP_PER_LEVEL = 200;

/** Base XP by difficulty */
const BASE_XP = { easy: 100, medium: 200, hard: 300 };

/** Streak multiplier table */
const streakMultiplier = (streak) => {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.5;
  if (streak >= 7)  return 1.25;
  if (streak >= 3)  return 1.1;
  return 1.0;
};

/**
 * Calculate XP awarded for a quest submission.
 * @param {string} difficulty - easy | medium | hard
 * @param {boolean} firstTry  - did user get it right first time?
 * @param {number}  streak    - current streak count
 */
const calculateQuestXp = (difficulty = 'easy', firstTry = false, streak = 0) => {
  const base    = BASE_XP[difficulty] ?? 100;
  const bonus   = firstTry ? 50 : 0;
  const mult    = streakMultiplier(streak);
  return Math.round((base + bonus) * mult);
};

/** Level from total XP */
const calcLevel = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;

/** XP required to start a given level */
const calcXpForLevel = (level) => (level - 1) * XP_PER_LEVEL;

/** XP remaining until next level */
const calcXpToNext = (xp) => {
  const lvl = calcLevel(xp);
  return calcXpForLevel(lvl + 1) - xp;
};

/** Progress (0–100) within the current level */
const calcLevelProgress = (xp) => {
  const lvl   = calcLevel(xp);
  const start = calcXpForLevel(lvl);
  const end   = calcXpForLevel(lvl + 1);
  return ((xp - start) / (end - start)) * 100;
};

/**
 * Check if a level-up occurred.
 * @returns {{ leveledUp: boolean, newLevel: number, oldLevel: number }}
 */
const checkLevelUp = (oldXp, newXp) => {
  const oldLevel = calcLevel(oldXp);
  const newLevel = calcLevel(newXp);
  return { leveledUp: newLevel > oldLevel, newLevel, oldLevel };
};

module.exports = {
  calculateQuestXp,
  calcLevel,
  calcXpForLevel,
  calcXpToNext,
  calcLevelProgress,
  checkLevelUp,
  streakMultiplier,
};
