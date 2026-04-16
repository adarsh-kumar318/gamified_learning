const router = require('express').Router();
const { saveProgress, getProgress, completeQuest } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.use(protect); // Ensure all progress routes are guarded

router.post('/save',      saveProgress);
router.get('/:questId',   getProgress);
router.post('/complete',  completeQuest);

module.exports = router;
