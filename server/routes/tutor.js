const router = require('express').Router();
const { chat, explain } = require('../controllers/tutorController');
const { protect } = require('../middleware/auth');

router.post('/chat',    protect, chat);
router.post('/explain', protect, explain);

module.exports = router;
