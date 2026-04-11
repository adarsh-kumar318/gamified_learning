const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { getQuestions, getSubjectStats } = require('../controllers/questionController');

// GET /api/questions?subject=DSA&difficulty=easy&limit=5
// GET /api/questions?mixed=true&limit=5
router.get('/', auth, getQuestions);

// GET /api/questions/subjects  — subject list + stats
router.get('/subjects', auth, getSubjectStats);

module.exports = router;
