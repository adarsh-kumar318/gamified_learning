const { db, admin } = require('../utils/firebase');
const { checkNewBadges } = require('../utils/badgeEngine');
const { toPublic } = require('../models/User');

// GET /api/quests
// Lists all quests with their current progress for the user
const listQuests = async (req, res) => {
  try {
    const questsQuery = await db.collection('quests').get();
    let quests = questsQuery.docs.map(d => ({ _id: d.id, ...d.data() }));

    // Memory filter to act like Mongoose $or: [ { isAI: { $ne: true } }, { createdBy: req.user._id } ]
    quests = quests.filter(q => q.isAI !== true || q.createdBy === req.user._id);

    // Sort by level ascending
    quests.sort((a, b) => (a.level || 0) - (b.level || 0));

    const progressQuery = await db.collection('progress')
      .where('userId', '==', req.user._id)
      .get();
    
    const progress = progressQuery.docs.map(d => d.data());

    // Merge progress into quest metadata
    const questsWithProgress = quests.map(q => {
      const p = progress.find(pr => pr.questId === q.id);
      return {
        ...q,
        completedCount: p ? (p.answers ? p.answers.length : 0) : 0,
        totalQuestions: q.questions ? q.questions.length : 0,
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
    const questQuery = await db.collection('quests').where('id', '==', req.params.id).limit(1).get();
    if (questQuery.empty) return res.status(404).json({ error: 'Quest not found.' });
    
    const quest = { _id: questQuery.docs[0].id, ...questQuery.docs[0].data() };

    // Find or create progress record
    const progressId = `${req.user._id}_${quest.id}`;
    let progressDoc = await db.collection('progress').doc(progressId).get();
    let progress;

    if (!progressDoc.exists) {
      progress = { userId: req.user._id, questId: quest.id, answers: [], percentage: 0 };
    } else {
      progress = progressDoc.data();
    }

    // INITIALIZE SHUFFLE
    if (!progress.shuffledQuestions || progress.shuffledQuestions.length === 0) {
      const allPool = quest.questions || [];
      
      const poolSize = quest.isBoss ? allPool.length : Math.min(allPool.length, 10);
      const randomSelection = shuffleArray(allPool).slice(0, poolSize);

      const finalSequence = randomSelection.map((q, idx) => {
        const originalOptions = q.options;
        const originalAnswerText = originalOptions[q.correctAnswer];
        
        const shuffledOpts = shuffleArray(originalOptions);
        const newAnswerIndex = shuffledOpts.indexOf(originalAnswerText);

        return {
          originalIndex: idx,
          question: q.question,
          options: shuffledOpts,
          correctAnswerIndex: newAnswerIndex
        };
      });

      progress.shuffledQuestions = finalSequence;
      progress.answers = []; 
      progress.currentQuestionIndex = 0;
      progress.percentage = 0;
      await db.collection('progress').doc(progressId).set(progress, { merge: true });
    }

    const safeQuestions = (progress.shuffledQuestions || []).map((q, idx) => ({
      question: q.question,
      options: q.options,
      isCompleted: idx < progress.currentQuestionIndex
    }));

    res.json({
      ...quest,
      questions: safeQuestions,
      progress: {
        completedCount: progress.answers ? progress.answers.length : 0,
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
    
    // Auth middleware already fetched user, but we need fresh to be safe
    let userDoc = await db.collection('users').doc(req.user._id).get();
    let user = { _id: userDoc.id, ...userDoc.data() };
    
    if (user.energy <= 0) return res.status(403).json({ error: 'No energy left! Rest at the inn. 🏮' });

    const progressId = `${user._id}_${req.params.id}`;
    let progressDoc = await db.collection('progress').doc(progressId).get();
    
    if (!progressDoc.exists) return res.status(400).json({ error: 'Invalid question state.' });
    let progress = progressDoc.data();

    if (!progress.shuffledQuestions || !progress.shuffledQuestions[questionIndex]) {
      return res.status(400).json({ error: 'Invalid question state.' });
    }

    const question = progress.shuffledQuestions[questionIndex];
    const isCorrect = selectedOption === question.correctAnswerIndex;
    
    if (!isCorrect) {
      user.energy = Math.max(0, user.energy - 1);
      await db.collection('users').doc(user._id).update({ energy: user.energy });
      return res.json({ 
        correct: false, 
        energy: user.energy,
        explanation: "Mistakes happen. The path to mastery is rarely straight." 
      });
    }

    // Award XP & Coins
    const xpReward = 20;
    const coinReward = 15;        
    const completionBonus = 150;    
    user.xp = (user.xp || 0) + xpReward;
    user.coins = (user.coins || 0) + coinReward;

    // Update Progress
    if (!progress.answers) progress.answers = [];
    if (!progress.answers.some(a => a.questionIndex === questionIndex)) {
        progress.answers.push({ questionIndex, selectedOption });
        progress.currentQuestionIndex = Math.max((progress.currentQuestionIndex || 0), questionIndex + 1);
        progress.percentage = Math.round((progress.answers.length / progress.shuffledQuestions.length) * 100);
    }

    if (progress.percentage >= 80 && !progress.isCompleted) {
      progress.isCompleted = true;
      user.xp += 100;
      user.coins += completionBonus;
    }

    const newBadges = checkNewBadges(user); // Might modify user.earnedBadges

    await Promise.all([
      db.collection('users').doc(user._id).update(user),
      db.collection('progress').doc(progressId).set(progress, { merge: true })
    ]);

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
        const progressId = `${req.user._id}_${req.params.id}`;
        await db.collection('progress').doc(progressId).delete();
        res.json({ message: 'Trial reset. Shuffling new questions...' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to restart quest.' });
    }
};

module.exports = { listQuests, getQuest, submitAnswer, restartQuest };
