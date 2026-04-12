const { db } = require('../utils/firebase');

const SUBJECTS = ['Agentic AI', 'DSA', 'Mathematics', 'Science'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

// Helper to shuffle
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getQuestions = async (req, res) => {
  try {
    let { subject, difficulty, limit = 5, mixed } = req.query;
    limit = Math.min(parseInt(limit) || 5, 20); // max 20

    let questionsQuery = db.collection('battleQuestions');

    if (mixed !== 'true') {
      if (subject && SUBJECTS.includes(subject)) {
        questionsQuery = questionsQuery.where('subject', '==', subject);
      } else if (subject) {
        return res.status(400).json({ error: `Invalid subject. Choose from: ${SUBJECTS.join(', ')}` });
      }
      if (difficulty && DIFFICULTIES.includes(difficulty)) {
        questionsQuery = questionsQuery.where('difficulty', '==', difficulty);
      }
    }

    const snapshot = await questionsQuery.get();
    let allQuestions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    if (allQuestions.length === 0) {
      return res.status(404).json({
        error: 'No questions found for the given filters.',
        hint: 'Run: node server/scripts/seedBattleQuestions.js'
      });
    }

    // In-memory random sample since Firestore lacks $sample
    const questions = shuffleArray(allQuestions).slice(0, limit);

    res.json({
      total: questions.length,
      subject: subject || 'Mixed',
      difficulty: difficulty || 'All',
      questions,
    });
  } catch (err) {
    console.error('Question fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
};

const getSubjectStats = async (req, res) => {
  try {
    const snapshot = await db.collection('battleQuestions').get();
    const statsMap = {};
    
    SUBJECTS.forEach(s => {
      statsMap[s] = { total: 0, byDifficulty: { easy: 0, medium: 0, hard: 0 } };
    });

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const sub = data.subject;
      const diff = data.difficulty;
      
      if (statsMap[sub]) {
        statsMap[sub].total += 1;
        if (diff && statsMap[sub].byDifficulty[diff] !== undefined) {
           statsMap[sub].byDifficulty[diff] += 1;
        }
      }
    });

    res.json({
      subjects: SUBJECTS,
      stats: Object.keys(statsMap).map(k => ({ subject: k, total: statsMap[k].total, byDifficulty: statsMap[k].byDifficulty }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subject stats.' });
  }
};

module.exports = { getQuestions, getSubjectStats };
