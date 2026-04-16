const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/auth');
const { getQuestions, getSubjectStats } = require('../controllers/questionController');

// GET /api/questions?subject=DSA&difficulty=easy&limit=5
// GET /api/questions?mixed=true&limit=5
router.get('/', protect, getQuestions);

// GET /api/questions/subjects  — subject list + stats
router.get('/subjects', protect, getSubjectStats);

module.exports = router;
