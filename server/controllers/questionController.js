const { db } = require('../utils/firebase');

const SUBJECTS     = ['Agentic AI', 'DSA', 'Mathematics', 'Science'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

// Max docs fetched from Firestore in a single read (avoids runaway costs)
const MAX_FETCH = 500;

/** Fisher-Yates shuffle */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const getQuestions = async (req, res) => {
  try {
    let { subject, difficulty, limit = 5, mixed } = req.query;
    limit = Math.min(parseInt(limit) || 5, 20); // hard cap: 20 questions per request

    // ─ Validate params ────────────────────────────────────────────────────────────
    if (subject && !SUBJECTS.includes(subject)) {
      return res.status(400).json({
        error: `Invalid subject "${subject}". Valid options: ${SUBJECTS.join(', ')}`
      });
    }
    if (difficulty && !DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        error: `Invalid difficulty "${difficulty}". Valid options: ${DIFFICULTIES.join(', ')}`
      });
    }

    // ─ Fetch from Firestore ─────────────────────────────────────────────────────────────
    let query = db.collection('battleQuestions');

    if (mixed === 'true' || (!subject && !difficulty)) {
      // Mixed / no filter: fetch a capped set then shuffle
      query = query.limit(MAX_FETCH);
    } else if (subject && !difficulty) {
      // Subject only — single-field filter (no composite index needed)
      query = query.where('subject', '==', subject);
    } else if (!subject && difficulty) {
      // Difficulty only — single-field filter
      query = query.where('difficulty', '==', difficulty);
    } else {
      // Both subject + difficulty:
      // Filter by subject in Firestore, then difficulty in-memory
      // (avoids requiring a composite index on both fields)
      query = query.where('subject', '==', subject);
    }

    const snapshot = await query.get();
    let allQuestions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    // In-memory difficulty filter when both subject + difficulty were requested
    if (subject && difficulty) {
      allQuestions = allQuestions.filter(q => q.difficulty === difficulty);
    }

    if (allQuestions.length === 0) {
      return res.status(404).json({
        error: 'No questions found for the given filters.',
        filters: { subject: subject || 'any', difficulty: difficulty || 'any', mixed: mixed || 'false' },
        hint: 'Seed the database: node server/scripts/seedBattleQuestions.js'
      });
    }

    // Random sample up to `limit`
    const questions = shuffle(allQuestions).slice(0, limit);

    res.json({
      total:      questions.length,
      subject:    subject    || 'Mixed',
      difficulty: difficulty || 'All',
      questions,
    });
  } catch (err) {
    console.error('[Questions] Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch questions: ' + err.message });
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
      const sub  = data.subject;
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
      stats: Object.keys(statsMap).map(k => ({
        subject: k,
        total: statsMap[k].total,
        byDifficulty: statsMap[k].byDifficulty
      }))
    });
  } catch (err) {
    console.error('Subject stats error:', err);
    res.status(500).json({ error: 'Failed to fetch subject stats: ' + err.message });
  }
};

module.exports = { getQuestions, getSubjectStats };
