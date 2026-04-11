const Progress = require('../models/Progress');
const User     = require('../models/User');
const Quest    = require('../models/Quest');

// POST /api/progress/save
// Body: { questId, currentQuestionIndex, answers }
const saveProgress = async (req, res) => {
  try {
    const { questId, currentQuestionIndex, answers } = req.body;
    const userId = req.user._id;

    // Upsert progress
    let progress = await Progress.findOne({ userId, questId });
    if (!progress) {
      progress = new Progress({ userId, questId });
    }

    progress.currentQuestionIndex = currentQuestionIndex;
    progress.answers = answers; // [{questionIndex, selectedOption}]
    progress.lastPlayedAt = new Date();
    
    await progress.save();
    res.json({ message: 'Trial progress bookmarked ⚔️', progress });
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

    const progress = await Progress.findOne({ userId, questId });
    if (!progress) return res.json({ message: 'No progress found.', progress: null });

    res.json({ progress });
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

    const [progress, user, quest] = await Promise.all([
      Progress.findOne({ userId, questId }),
      User.findById(userId),
      Quest.findOne({ id: questId })
    ]);

    if (!progress) return res.status(404).json({ error: 'No progress found to complete.' });
    if (progress.isCompleted) return res.json({ message: 'Trial already conquered!', user });

    // Mark completed
    progress.isCompleted = true;
    progress.score = score;
    await progress.save();

    // Award XP (Base 100 + score bonus? Or based on quest level)
    const baseXP = quest?.isBoss ? 200 : 100;
    const bonusXP = Math.floor(score / 10); // Reward for merit
    const totalXP = baseXP + bonusXP;

    user.xp += totalXP;
    user.coins += (quest?.isBoss ? 100 : 50);
    
    // Level up logic (Simple: every 1000 XP)
    user.level = Math.floor(user.xp / 1000) + 1;
    
    await user.save();

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
