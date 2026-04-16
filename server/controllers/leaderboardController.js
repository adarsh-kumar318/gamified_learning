// controllers/leaderboardController.js
const { db } = require('../utils/firebase');
const { calcLevel } = require('../utils/xpEngine');

/**
 * Map a Firestore user doc → leaderboard entry.
 */
const mapUser = (doc, rank) => {
  const d = doc.data();
  const xp = Number(d.xp) || 0;
  return {
    _id:      doc.id,
    rank,
    username: d.username  || 'Unknown Warrior',
    avatarId: d.avatarId  || null,
    xp,
    level:    calcLevel(xp),
    streak:   Number(d.streak) || 0,
  };
};

// ─── GET /api/leaderboard ─────────────────────────────────────────────────────
// Global top 100 by total XP.
// Tries Firestore orderBy first; falls back to full fetch + in-memory sort
// when the single-field index on 'xp' hasn't been created yet.
const globalLeaderboard = async (req, res) => {
  try {
    let docs;

    try {
      // Fast path — requires Firestore single-field descending index on 'xp'
      const snap = await db.collection('users')
        .orderBy('xp', 'desc')
        .limit(100)
        .get();
      docs = snap.docs;
    } catch (indexErr) {
      // Fallback: fetch all users and sort in memory
      // (Firestore index not yet created — this is common on first deploy)
      console.warn('[Leaderboard] Firestore index missing, falling back to in-memory sort:', indexErr.code);
      const snap = await db.collection('users').get();
      docs = snap.docs
        .sort((a, b) => (Number(b.data().xp) || 0) - (Number(a.data().xp) || 0))
        .slice(0, 100);
    }

    if (!docs.length) return res.json([]);

    const lb = docs.map((doc, i) => mapUser(doc, i + 1));
    res.json(lb);
  } catch (err) {
    console.error('[Leaderboard] Global error:', err);
    res.status(500).json({ error: 'Could not fetch leaderboard: ' + err.message });
  }
};

// ─── GET /api/leaderboard/weekly ──────────────────────────────────────────────
// weeklyXp is stored as a 7-element array [sun, mon, tue, wed, thu, fri, sat].
// Firestore cannot sum/order by array element totals, so we sort in memory.
const weeklyLeaderboard = async (req, res) => {
  try {
    // Fetch up to 1000 users — sort weekly total in memory
    const snap = await db.collection('users').limit(1000).get();

    if (snap.empty) return res.json([]);

    const lb = snap.docs
      .map(doc => {
        const d = doc.data();
        const xp = Number(d.xp) || 0;

        // weeklyXp: 7-element number array, guard against missing/malformed
        const weeklyXpArr = Array.isArray(d.weeklyXp)
          ? d.weeklyXp.map(v => Number(v) || 0)
          : [0, 0, 0, 0, 0, 0, 0];

        const weeklyTotal = weeklyXpArr.reduce((a, b) => a + b, 0);

        return {
          _id:        doc.id,
          username:   d.username  || 'Unknown Warrior',
          avatarId:   d.avatarId  || null,
          xp,
          level:      calcLevel(xp),
          streak:     Number(d.streak) || 0,
          weeklyTotal,
          weeklyXp:   weeklyXpArr,
        };
      })
      .filter(u => u.weeklyTotal > 0)              // Only active-this-week users
      .sort((a, b) => b.weeklyTotal - a.weeklyTotal)
      .slice(0, 100)
      .map((u, i) => ({ ...u, rank: i + 1 }));

    res.json(lb);
  } catch (err) {
    console.error('[Leaderboard] Weekly error:', err);
    res.status(500).json({ error: 'Could not fetch weekly leaderboard: ' + err.message });
  }
};

module.exports = { globalLeaderboard, weeklyLeaderboard };
