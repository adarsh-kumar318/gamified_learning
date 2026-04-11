const BattleQuestion = require('../models/BattleQuestion');

const SUBJECTS = ['Agentic AI', 'DSA', 'Mathematics', 'Science'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * GET /api/questions
 * Query params:
 *   subject     — one of SUBJECTS (optional, random if omitted)
 *   difficulty  — easy | medium | hard (optional)
 *   limit       — number of questions to return (default: 5)
 *   mixed       — "true" to fetch from all subjects randomly
 */
const getQuestions = async (req, res) => {
  try {
    let { subject, difficulty, limit = 5, mixed } = req.query;
    limit = Math.min(parseInt(limit) || 5, 20); // max 20

    const filter = {};

    if (mixed === 'true') {
      // Mixed mode: random subject selection per question — no filter needed
    } else {
      // Subject filter
      if (subject && SUBJECTS.includes(subject)) {
        filter.subject = subject;
      } else if (subject) {
        return res.status(400).json({
          error: `Invalid subject. Choose from: ${SUBJECTS.join(', ')}`
        });
      }

      // Difficulty filter
      if (difficulty && DIFFICULTIES.includes(difficulty)) {
        filter.difficulty = difficulty;
      }
    }

    // Fetch random questions using MongoDB aggregation
    const questions = await BattleQuestion.aggregate([
      { $match: filter },
      { $sample: { size: limit } },
      {
        $project: {
          _id: 0,
          id: '$_id',
          subject: 1,
          topic: 1,
          question: 1,
          options: 1,
          correctAnswer: 1,
          difficulty: 1,
          explanation: 1,
        }
      }
    ]);

    if (questions.length === 0) {
      return res.status(404).json({
        error: 'No questions found for the given filters.',
        hint: 'Run: node server/scripts/seedBattleQuestions.js'
      });
    }

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

/**
 * GET /api/questions/subjects
 * Returns available subjects and count of questions per subject
 */
const getSubjectStats = async (req, res) => {
  try {
    const stats = await BattleQuestion.aggregate([
      {
        $group: {
          _id: '$subject',
          total: { $sum: 1 },
          easy:   { $sum: { $cond: [{ $eq: ['$difficulty', 'easy']   }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] } },
          hard:   { $sum: { $cond: [{ $eq: ['$difficulty', 'hard']   }, 1, 0] } },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      subjects: SUBJECTS,
      stats: stats.map(s => ({
        subject: s._id,
        total: s.total,
        byDifficulty: { easy: s.easy, medium: s.medium, hard: s.hard }
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subject stats.' });
  }
};

module.exports = { getQuestions, getSubjectStats };
