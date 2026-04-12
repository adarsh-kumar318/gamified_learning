const User     = require('../models/User');
const Quest    = require('../models/Quest');
const Progress = require('../models/Progress');
const XPLog    = require('../models/XPLog');
const { checkNewBadges } = require('../utils/badgeEngine');

// GET /api/quests
// Lists all quests with their current progress for the user
const listQuests = async (req, res) => {
  try {
    const quests = await Quest.find({
      $or: [
        { isAI: { $ne: true } }, 
        { createdBy: req.user._id }
      ]
    }).sort({ level: 1 });
    const progress = await Progress.find({ userId: req.user._id });

    // Merge progress into quest metadata
    const questsWithProgress = quests.map(q => {
      const p = progress.find(pr => pr.questId === q.id);
      return {
        ...q.toObject(),
        completedCount: p ? (p.answers ? p.answers.length : 0) : 0,
        totalQuestions: q.questions.length,
        isCompleted: p ? p.isCompleted : false,
        percentage: p ? p.percentage : 0,
        questions: undefined // Don't send questions in list
      };
    });

    res.json(questsWithProgress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quests.' });
  }
};

// Helper for Fisher-Yates Shuffle
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// GET /api/quests/:id
// Fetches a single quest with randomized questions and options (answers stripped)
const getQuest = async (req, res) => {
  try {
    const quest = await Quest.findOne({ id: req.params.id });
    if (!quest) return res.status(404).json({ error: 'Quest not found.' });

    // Find or create progress record
    let progress = await Progress.findOne({ userId: req.user._id, questId: quest.id });
    if (!progress) {
      progress = await Progress.create({ userId: req.user._id, questId: quest.id });
    }

    // INITIALIZE SHUFFLE if not already present (OR if level was completed and they are replaying)
    if (!progress.shuffledQuestions || progress.shuffledQuestions.length === 0) {
      const allPool = quest.questions;
      
      // 1. Pick a subset (e.g. 10 questions) OR just use all but shuffled
      const poolSize = quest.isBoss ? allPool.length : Math.min(allPool.length, 10);
      const randomSelection = shuffleArray(allPool).slice(0, poolSize);

      // 2. Shuffle Options for each question
      const finalSequence = randomSelection.map((q, idx) => {
        const originalOptions = q.options;
        const originalAnswerText = originalOptions[q.correctAnswer];
        
        const shuffledOpts = shuffleArray(originalOptions);
        const newAnswerIndex = shuffledOpts.indexOf(originalAnswerText);

        return {
          originalIndex: idx, // Not strictly used but good for audit
          question: q.question,
          options: shuffledOpts,
          correctAnswerIndex: newAnswerIndex
        };
      });

      progress.shuffledQuestions = finalSequence;
      progress.answers = []; // Reset answers for the new shuffle
      progress.currentQuestionIndex = 0;
      progress.percentage = 0;
      await progress.save();
    }

    // Strip answers for the frontend
    const safeQuestions = progress.shuffledQuestions.map((q, idx) => ({
      question: q.question,
      options: q.options,
      isCompleted: idx < progress.currentQuestionIndex
    }));

    res.json({
      ...quest.toObject(),
      questions: safeQuestions,
      progress: {
        completedCount: progress.answers.length,
        percentage: progress.percentage,
        isCompleted: progress.isCompleted,
        currentQuestionIndex: progress.currentQuestionIndex
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching randomized quest.' });
  }
};

// POST /api/quests/:id/submit-answer
const submitAnswer = async (req, res) => {
  try {
    const { questionIndex, selectedOption } = req.body;
    
    const user = await User.findById(req.user._id);
    if (user.energy <= 0) return res.status(403).json({ error: 'No energy left! Rest at the inn. 🏮' });

    let progress = await Progress.findOne({ userId: user._id, questId: req.params.id });
    if (!progress || !progress.shuffledQuestions[questionIndex]) {
      return res.status(400).json({ error: 'Invalid question state.' });
    }

    const question = progress.shuffledQuestions[questionIndex];

    const isCorrect = selectedOption === question.correctAnswerIndex;
    
    if (!isCorrect) {
      user.energy = Math.max(0, user.energy - 1);
      await user.save();
      return res.json({ 
        correct: false, 
        energy: user.energy,
        explanation: "Mistakes happen. The path to mastery is rarely straight." 
      });
    }

    // Award XP & Coins
    const xpReward = 20;
    const coinReward = 15;          // per correct answer
    const completionBonus = 150;    // on quest completion
    user.xp += xpReward;
    user.coins += coinReward;

    // Update Progress
    if (!progress.answers.some(a => a.questionIndex === questionIndex)) {
        progress.answers.push({ questionIndex, selectedOption });
        progress.currentQuestionIndex = Math.max(progress.currentQuestionIndex, questionIndex + 1);
        progress.percentage = Math.round((progress.answers.length / progress.shuffledQuestions.length) * 100);
    }

    if (progress.percentage >= 80 && !progress.isCompleted) {
      progress.isCompleted = true;
      user.xp += 100;
      user.coins += completionBonus;
    }

    await Promise.all([user.save(), progress.save()]);
    const newBadges = checkNewBadges(user);
    if (newBadges.length > 0) await user.save(); 

    res.json({
      correct: true,
      xpEarned: xpReward,
      coinsEarned: coinReward,
      percentage: progress.percentage,
      isCompleted: progress.isCompleted,
      energy: user.energy,
      user: { xp: user.xp, level: user.level, coins: user.coins, energy: user.energy, earnedBadges: user.earnedBadges },
      newBadges: newBadges
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error submitting answer.' });
  }
};

// POST /api/quests/:id/restart
const restartQuest = async (req, res) => {
    try {
        await Progress.deleteOne({ userId: req.user._id, questId: req.params.id });
        res.json({ message: 'Trial reset. Shuffling new questions...' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to restart quest.' });
    }
};

module.exports = { listQuests, getQuest, submitAnswer, restartQuest };
