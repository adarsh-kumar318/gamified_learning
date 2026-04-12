// controllers/progressController.js
const { db } = require('../utils/firebase');
const { toPublic } = require('../models/User');

// POST /api/progress/save
// Body: { questId, currentQuestionIndex, answers }
const saveProgress = async (req, res) => {
  try {
    const { questId, currentQuestionIndex, answers } = req.body;
    const userId = req.user._id;

    // Use a composite key for simple lookup or query
    const progressId = `${userId}_${questId}`;
    const progressRef = db.collection('progress').doc(progressId);
    
    const data = {
      userId,
      questId,
      currentQuestionIndex,
      answers, // [{questionIndex, selectedOption}]
      lastPlayedAt: new Date().toISOString()
    };

    await progressRef.set(data, { merge: true });
    
    // fetch updated record
    const progressDoc = await progressRef.get();
    res.json({ message: 'Trial progress bookmarked ⚔️', progress: { _id: progressDoc.id, ...progressDoc.data() } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to bookmark progress.' });
  }
};

// GET /api/progress/:questId
const getProgress = async (req, res) => {
  try {
    const { questId } = req.params;
    const userId = req.user._id;

    const progressId = `${userId}_${questId}`;
    const progressDoc = await db.collection('progress').doc(progressId).get();
    
    if (!progressDoc.exists) {
      return res.json({ message: 'No progress found.', progress: null });
    }

    res.json({ progress: { _id: progressDoc.id, ...progressDoc.data() } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resume state.' });
  }
};

// POST /api/progress/complete
// Body: { questId, score }
const completeQuest = async (req, res) => {
  try {
    const { questId, score } = req.body;
    const userId = req.user._id;
    const progressId = `${userId}_${questId}`;

    const [progressDoc, userDoc, questQuery] = await Promise.all([
      db.collection('progress').doc(progressId).get(),
      db.collection('users').doc(userId).get(),
      db.collection('quests').where('id', '==', questId).limit(1).get()
    ]);

    let progress = progressDoc.exists ? progressDoc.data() : null;
    let quest = !questQuery.empty ? questQuery.docs[0].data() : null;
    let user = userDoc.exists ? { _id: userDoc.id, ...userDoc.data() } : null;

    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (!progress) {
      // If they somehow completed it without saving progress first
      progress = { userId, questId, currentQuestionIndex: 0, answers: [] };
    }

    if (progress.isCompleted) return res.json({ message: 'Trial already conquered!', user: toPublic(user) });

    // Mark completed
    progress.isCompleted = true;
    progress.score = score;
    await db.collection('progress').doc(progressId).set(progress, { merge: true });

    // Award XP (Base 100 + score bonus? Or based on quest level)
    const baseXP = quest?.isBoss ? 200 : 100;
    const bonusXP = Math.floor(score / 10); // Reward for merit
    const totalXP = baseXP + bonusXP;

    user.xp += totalXP;
    user.coins += (quest?.isBoss ? 100 : 50);
    
    // Level up logic (Simple: every 1000 XP)
    user.level = Math.floor(user.xp / 1000) + 1;
    
    await db.collection('users').doc(user._id).update(user);

    res.json({ 
      message: '👑 Legend! Trial Conquered.', 
      xpEarned: totalXP, 
      user: { xp: user.xp, level: user.level, coins: user.coins } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to finalize trial.' });
  }
};

module.exports = { saveProgress, getProgress, completeQuest };
