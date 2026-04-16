const router = require('express').Router();
const { listQuests, getQuest, submitAnswer, restartQuest } = require('../controllers/questController');
const { generateQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/',            listQuests);
router.post('/generate',    generateQuiz);
router.get('/:id',         getQuest);
router.post('/:id/submit', submitAnswer);
router.post('/:id/restart', restartQuest);

module.exports = router;
